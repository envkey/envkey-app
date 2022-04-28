import { takeLatest, take, put, select, call} from 'redux-saga/effects'
import {delay} from 'redux-saga'
import { push } from 'react-router-redux'
import R from 'ramda'
import {
  apiSaga,
  envParamsForUpdateOrgRole,
  dispatchDecryptAllIfNeeded,
  redirectFromOrgIndexIfNeeded,
  execUpdateTrustedPubkeys
} from './helpers'
import {
  UPDATE_ORG_ROLE,
  UPDATE_ORG_ROLE_REQUEST,
  UPDATE_ORG_ROLE_SUCCESS,
  UPDATE_ORG_ROLE_FAILED,

  UPDATE_ORG_OWNER_REQUEST,
  UPDATE_ORG_OWNER_SUCCESS,
  UPDATE_ORG_OWNER_FAILED,

  // REMOVE_SELF_FROM_ORG,
  // REMOVE_SELF_FROM_ORG_FAILED,
  // REMOVE_SELF_FROM_ORG_SUCCESS,

  CREATE_ORG_REQUEST,
  CREATE_ORG_SUCCESS,
  CREATE_ORG_FAILED,

  SOCKET_SUBSCRIBE_ORG_CHANNEL,
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS,
  FETCH_CURRENT_USER_UPDATES_SUCCESS,

  REMOVE_OBJECT_SUCCESS,
  REMOVE_OBJECT_FAILED,

  GENERATE_DEMO_ORG_REQUEST,
  GENERATE_DEMO_ORG_SUCCESS,
  GENERATE_DEMO_ORG_FAILED,

  EXPORT_ORG,
  EXPORT_ORG_SUCCESS,
  EXPORT_ORG_FAILED,

  updateOrgRoleRequest,
  updateOrgOwner,
  addTrustedPubkey,
  removeObject,
  fetchCurrentUserUpdates
} from 'actions'
import {
  getCurrentOrg,
  getCurrentUser,
  getOrgUserForUser,
  getOrgUsers,
  getApps,
  getAppUsers,
  getServers,
  getEnvsWithMetaWithPending,
  getActiveUsers,
  getPendingUsers
} from 'selectors'
import { allEntries, subEnvEntries } from 'lib/env/query'
import { secureRandomAlphanumeric } from 'lib/crypto'
import { secretbox, randomBytes } from 'tweetnacl'
import { encodeBase64, decodeUTF8, decodeBase64 } from 'tweetnacl-util'
import { codec, hash } from 'sjcl'
import uuid from 'uuid'
import isElectron from 'is-electron'

const
  onUpdateOrgRoleRequest = apiSaga({
    authenticated: true,
    method: "post",
    actionTypes: [UPDATE_ORG_ROLE_SUCCESS, UPDATE_ORG_ROLE_FAILED],
    urlFn: (action)=> `/org_users.json`
  }),

  onCreateOrgRequest = apiSaga({
    authenticated: true,
    method: "post",
    actionTypes: [CREATE_ORG_SUCCESS, CREATE_ORG_FAILED],
    urlFn: (action)=> `/orgs.json`
  }),

  onUpdateOrgOwnerRequest = apiSaga({
    authenticated: true,
    method: "patch",
    urlSelector: getCurrentOrg,
    actionTypes: [UPDATE_ORG_OWNER_SUCCESS, UPDATE_ORG_OWNER_FAILED],
    urlFn: (action, currentOrg)=> `/orgs/${currentOrg.slug}/update_owner.json`
  }),

  onGenerateDemoOrgRequest = apiSaga({
    authenticated: false,
    method: "post",
    minDelay: 1200,
    actionTypes: [GENERATE_DEMO_ORG_SUCCESS, GENERATE_DEMO_ORG_FAILED],
    urlFn: (action)=> "/orgs/generate_demo_org.json"
  })

function *onUpdateOrgRole({payload: {role, userId, orgUserId}}){
  yield put(fetchCurrentUserUpdates())
  yield take(FETCH_CURRENT_USER_UPDATES_SUCCESS)
  const envs = yield call(envParamsForUpdateOrgRole, {userId, role})
  yield put(updateOrgRoleRequest({envs, role, userId, orgUserId}))
}

function *onCreateOrgSuccess(action){
  const currentOrg = yield select(getCurrentOrg),
        currentUser = yield select(getCurrentUser)

  yield put(addTrustedPubkey({keyable: {type: "user", ...currentUser}, orgId: currentOrg.id}))

  yield call(dispatchDecryptAllIfNeeded)

  const updateTrustedRes = yield call(execUpdateTrustedPubkeys, currentOrg.slug)
  if (!updateTrustedRes.error){
    yield put(push(`/${currentOrg.slug}`))
    yield put({type: SOCKET_SUBSCRIBE_ORG_CHANNEL})
    yield call(redirectFromOrgIndexIfNeeded)
    var overlay = document.getElementById("preloader-overlay")
    if(!overlay.className.includes("hide")){
      overlay.className += " hide"
    }
    document.body.className = document.body.className.replace("no-scroll","")
                                                     .replace("preloader-authenticate","")

  }
}

function *onRemoveSelfFromOrg(action){
  const currentUser = yield select(getCurrentUser),
        orgUser = yield select(getOrgUserForUser(currentUser.id))

  let err

  if (currentUser.role == "org_owner"){
    const {newOwnerId} = action.meta
    yield put(updateOrgOwner({newOwnerId}))
    const updateOwnerRes = yield take([UPDATE_ORG_OWNER_SUCCESS, UPDATE_ORG_OWNER_FAILED])

    if (updateOwnerRes.error){
      err = updateOwnerRes.payload
    }
  }

  if (!err){
    yield put(removeObject({objectType: "orgUser", targetId: orgUser.id}))
    const removeRes = yield take([REMOVE_OBJECT_SUCCESS, REMOVE_OBJECT_FAILED])
    if (removeRes.error){
      err = removeRes.payload
    }
  }

  if (err){
    yield put({type: REMOVE_SELF_FROM_ORG_FAILED, payload: err, error: true})
  } else {
    yield put({type: REMOVE_SELF_FROM_ORG_SUCCESS})
  }
}

function *onUpdateOrgOwnerSuccess(action){
  const currentOrg = yield select(getCurrentOrg)
  yield put(fetchCurrentUserUpdates({noMinUpdatedAt: true}))
  yield take(FETCH_CURRENT_USER_UPDATES_API_SUCCESS)
  yield put(push(`/${currentOrg.slug}`))
  yield call(redirectFromOrgIndexIfNeeded)
}

function *onGenerateDemoOrgSuccess({payload: {path}}){
  yield put(push(path))
}

function *onExportOrg(action){
  if (!isElectron()){
    return
  }

  yield call(delay, 50)

  try {
    const currentOrg = yield select(getCurrentOrg)
    const apps = yield select(getApps)
    const activeUsers = yield select(getActiveUsers)
    const pendingUsers = yield select(getPendingUsers)
    const appUsers = yield select(getAppUsers)
    const servers = yield select(getServers)

    console.log("yielded initial selects...")

    const ownerOrgRole = {
      id: uuid(),
      defaultName: "Org Owner"
    }

    const adminOrgRole = {
      id: uuid(),
      defaultName: "Org Admin"
    }

    const basicUserOrgRole = {
      id: uuid(),
      defaultName: "Basic User"
    }

    const orgOwnerAppRole = {
      id: uuid(),
      defaultName: "Org Owner"
    }

    const orgAdminAppRole = {
      id: uuid(),
      defaultName: "Org Admin"
    }

    const appAdminAppRole = {
      id: uuid(),
      defaultName: "Admin"
    }

    const devopsAppRole = {
      id: uuid(),
      defaultName: "DevOps"
    }

    const developerAppRole = {
      id: uuid(),
      defaultName: "Developer"
    }

    const developmentEnvironmentRole = {
      id: uuid(),
      defaultName: "Development",
      settings: {
        autoCommit: false
      }
    }

    const stagingEnvironmentRole = {
      id: uuid(),
      defaultName: "Staging",
      settings: {
        autoCommit: false
      }
    }

    const productionEnvironmentRole = {
       id: uuid(),
       defaultName: "Production",
       settings: {
         autoCommit: false
       }
    }

    const environmentRoleIdsByRole = {
      "development": developmentEnvironmentRole.id,
      "staging": stagingEnvironmentRole.id,
      "production": productionEnvironmentRole.id
    }

    const baseEnvironments = [];
    const subEnvironmentsById = {};
    const baseEnvironmentIdsByAppIdByRole = {};
    const envs = {};

    console.log("exporting apps...");

    for (let app of apps){
      console.log("exporting app:", app.name);

      const envsWithMeta = yield select(getEnvsWithMetaWithPending("app", app.id));

      console.log("got envsWithMeta.");

      const baseEnvironmentIdsByRole = {}

      const baseEnvEntries = allEntries(envsWithMeta)

      console.log("got baseEnvEntries.");

      for (let role in envsWithMeta){
        console.log("exporting role:", role);

        const environmentRoleId = environmentRoleIdsByRole[role]
        if (!environmentRoleId){
          console.log("No environmentRoleId, skipping...");
          continue
        }

        const environment = {
          id: uuid(),
          envParentId: app.id,
          environmentRoleId,
          settings: {
            autoCommit: false
          }
        }
        baseEnvironmentIdsByRole[role] = environment.id
        baseEnvironments.push(environment)

        const env = envsWithMeta[role]
        const subEnvs = env["@@__sub__"]

        if (subEnvs){
          for (let id in subEnvs){
            console.log("Exporting subEnv:", id);

            const subEnv = subEnvs[id]

            const name = subEnv["@@__name__"]

            subEnvironmentsById[id] = {
              id,
              isSub: true,
              envParentId: app.id,
              environmentRoleId: environmentRoleIdsByRole[role],
              subName: name,
              parentEnvironmentId: baseEnvironmentIdsByRole[role]
            }

            console.log("set subEnvironmentsById.")

            const entries = subEnvEntries(envsWithMeta, id)

            console.log("get subEnvEntries.")

            const vars = {}
            for (let k of entries){
              const cell = subEnv[k];
              vars[k] = cell ? {
                isEmpty: cell.val == "",
                isUndefined: cell.val == null || typeof cell.val == "undefined",
                val: cell == "" ? "" : (cell.val || undefined)
              } : {
                isUndefined: true,
                val: undefined
              }
            }

            envs[id] = {
              inherits: {},
              variables: vars
            }

            console.log("finished subEnv.")
          }
        }

        console.log("finished role:", role);
      }

      for (let role in envsWithMeta){
        console.log("exporting role second pass:", role);

        const environmentRoleId = environmentRoleIdsByRole[role]
        if (!environmentRoleId){
          console.log("No environmentRoleId, skipping...");
          continue
        }

        const environmentId = baseEnvironmentIdsByRole[role]

        const env = envsWithMeta[role]
        const inherits = {}
        const vars = {}
        for (let k of baseEnvEntries){
          const cell = env[k];
          vars[k] = cell ? {
            isEmpty: cell.val == "",
            isUndefined: !cell.inherits && (cell.val == null || typeof cell.val == "undefined"),
            val: cell == "" ? "" : (cell.val || undefined),
            inheritsEnvironmentId: cell.inherits ? baseEnvironmentIdsByRole[cell.inherits] : undefined
          } : {
            isUndefined: true,
            val: undefined
          }
        }

        envs[environmentId] = {
          inherits: {},
          variables: vars
        }

        console.log("finished role second pass:", role);
      }

      baseEnvironmentIdsByAppIdByRole[app.id] = baseEnvironmentIdsByRole
    }

    const archiveApps = apps.map(app => ({
      id: app.id,
      name: app.name,
      settings: {
        autoCaps: app.autoCaps || false,
        autoCommitLocals: false
      }
    }));

    console.log("finished archiveApps")

    const archiveServers = servers.filter(
      server => server.pubkey
    ).map(
      server => {
        return {
          appId: server.appId,
          environmentId: server.subEnvId ?
            subEnvironmentsById[server.subEnvId].id :
            baseEnvironmentIdsByAppIdByRole[server.appId][server.role],
          name: server.name
        }
      }
    );

    console.log("finished archiveServers")

    const archiveOrgUsers = [...activeUsers, ...pendingUsers].map(
      user => {
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          provider: "email",
          uid: user.email,
          orgRoleId: {
            "org_owner": ownerOrgRole.id,
            "org_admin": adminOrgRole.id,
            "basic": basicUserOrgRole.id
          }[user.role]
        }
      }
     );

   console.log("finished archiveOrgUsers")

    const archiveAppUserGrants = appUsers.filter(
      appUser => appUser.role != "org_owner" && appUser.role != "org_admin"
    ).map(
      appUser => {
        return {
          appId: appUser.appId,
          userId: appUser.userId,
          appRoleId: {
            admin: appAdminAppRole.id,
            production: devopsAppRole.id,
            development: developerAppRole.id
          }[appUser.role]
        }
      }
    );

    console.log("finished archiveAppUserGrants");

    const archive = {
      schemaVersion: "1",
      org: {
        id: currentOrg.id,
        name: currentOrg.name,
        settings: {
          crypto: {
            requiresPassphrase: false,
            requiresLockout: false,
          },
          auth: {
            inviteExpirationMs: 1000 * 60 * 60 * 24,
            deviceGrantExpirationMs: 1000 * 60 * 60 * 24,
            tokenExpirationMs: 1000 * 60 * 60 * 24 * 7 * 4
          },
          envs: {
            autoCaps: true,
            autoCommitLocals: false
          }
        }
      },
      apps: archiveApps,
      blocks: [],
      appBlocks: [],
      defaultOrgRoles: [
        ownerOrgRole,
        adminOrgRole,
        basicUserOrgRole
      ],
      defaultAppRoles: [
        orgOwnerAppRole,
        orgAdminAppRole,
        appAdminAppRole,
        devopsAppRole,
        developerAppRole
      ],
      defaultEnvironmentRoles: [
        developmentEnvironmentRole,
        stagingEnvironmentRole,
        productionEnvironmentRole
      ],
      nonDefaultEnvironmentRoles: [],
      nonDefaultAppRoleEnvironmentRoles: [],
      baseEnvironments,
      subEnvironments: R.values(subEnvironmentsById),
      servers: archiveServers,
      orgUsers: archiveOrgUsers,
      cliUsers: [],
      appUserGrants: archiveAppUserGrants,
      envs
    }

    console.log("finished archive")

    const encryptionKey = secureRandomAlphanumeric(25)
    const json = JSON.stringify(archive)
    const key = decodeBase64(codec.base64.fromBits(hash.sha256.hash(encryptionKey)))
    const nonce = randomBytes(24)

    const encrypted = {
      nonce: encodeBase64(nonce),
      data: encodeBase64(secretbox(decodeUTF8(json), nonce, key))
    }

    console.log("encrypted archive")

    const res = yield new Promise((resolve)=> {
      const fileName = `${currentOrg.name.split(" ").join("-").toLowerCase()}-${new Date().toISOString().slice(0,10)}.envkey-archive`

       window.saveFile(
        `Export EnvKey Archive`,
        fileName,
        JSON.stringify(encrypted),
        err => {
          if (err){
            console.log("Error saving Org Archive file", {fileName, err});
            console.trace();
          }
          resolve(err || null)
        }
      )
    })

    if (res == null){
      yield put({type: EXPORT_ORG_SUCCESS})
      alert(`Encrypted archive saved. It can be re-imported into a fresh organization in EnvKey v2 using the following Encryption Key:\n\n${encryptionKey}`)
    } else {
      yield put({type: EXPORT_ORG_FAILED, payload: res})
    }


  } catch (err){
    console.log("EXPORT ORG error:")
    console.log(err)
    console.trace()

    yield put({type: EXPORT_ORG_FAILED, payload: err})
  }
}

export default function* orgSagas(){
  yield [
    takeLatest(UPDATE_ORG_ROLE, onUpdateOrgRole),
    takeLatest(UPDATE_ORG_ROLE_REQUEST, onUpdateOrgRoleRequest),
    takeLatest(CREATE_ORG_REQUEST, onCreateOrgRequest),
    takeLatest(CREATE_ORG_SUCCESS, onCreateOrgSuccess),
    takeLatest(UPDATE_ORG_OWNER_REQUEST, onUpdateOrgOwnerRequest),
    takeLatest(UPDATE_ORG_OWNER_SUCCESS, onUpdateOrgOwnerSuccess),
    takeLatest(GENERATE_DEMO_ORG_REQUEST, onGenerateDemoOrgRequest),
    takeLatest(GENERATE_DEMO_ORG_SUCCESS, onGenerateDemoOrgSuccess),
    takeLatest(EXPORT_ORG, onExportOrg)
    // takeLatest(REMOVE_SELF_FROM_ORG, onRemoveSelfFromOrg)
  ]
}

