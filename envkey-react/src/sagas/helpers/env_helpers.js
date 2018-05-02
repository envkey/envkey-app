import { put, select, call } from 'redux-saga/effects'
import R from 'ramda'
import {envParamsForApp} from './attach_envs_helpers'
import {signTrustedPubkeyChain} from './crypto_helpers'
import {
  getEnvsWithMetaWithPending,
  getEnvActionsPendingByEnvUpdateId,
  getEnvUpdateId,
  getIsRequestingEnvUpdate,
  getHasEnvActionsPending,
  getObject,
  getSocketUserUpdatingEnvs,
  getServersForSubEnv,
  getCurrentOrg,
  getAppUserBy,
  getLocalKey,
  getServer,
  getUser,
  getPrivkey
} from 'selectors'
import {
  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
  updateEnvRequest,
  removeAssoc,
  addAssoc
} from "actions"
import { s3Client } from 'lib/s3'
import { secureRandomAlphanumeric, encryptJson } from 'lib/crypto'

let dispatchingEnvUpdateId

export function* dispatchEnvUpdateRequest(params){
  const {meta={}, parentId, parentType, skipDelay, updatePending} = params,
        envUpdateId = meta.forceEnvUpdateId || (yield select(getEnvUpdateId(parentId)))

  if(dispatchingEnvUpdateId == envUpdateId && !updatePending)return
  dispatchingEnvUpdateId = envUpdateId

  const
    parent = yield select(getObject(parentType, parentId)),
    envsWithMeta = yield select(getEnvsWithMetaWithPending(parentType, parentId)),
    envActionsPendingBefore = yield select(getEnvActionsPendingByEnvUpdateId(parentId, envUpdateId)),
    signedByTrustedPubkeys = yield call(signTrustedPubkeyChain),
    envActionsPending = yield select(getEnvActionsPendingByEnvUpdateId(parentId, envUpdateId)),
    privkey = yield select(getPrivkey)

  let envParams = yield call(envParamsForApp, {appId: parentId, envsWithMeta})

  if (envActionsPendingBefore.length != envActionsPending.length){
    yield call(dispatchEnvUpdateRequest, {...params, updatePending: true})
    return
  }

  const currentOrg = yield select(getCurrentOrg),
        client = s3Client()

  if (currentOrg.storageStrategy == "s3"){
    const updatePaths = [],
          encryptUrlQueue = [],
          requestQueue = []

    if (envParams.users){
      for (let userId in envParams.users){
        let apps = envParams.users[userId].apps
        for (let appId in apps){
          let appEnvsWithMeta  = apps[appId].envsWithMeta,
              appUser = yield select(getAppUserBy({userId, appId})),
              user = yield select(getUser(userId))

          for (let environment in appEnvsWithMeta){
            let s3Info = appUser.s3UploadInfo[environment]

            if (s3Info){
              let env = appEnvsWithMeta[environment],
                  secret = secureRandomAlphanumeric(20),
                  fields = JSON.parse(s3Info.fields),
                  data = new FormData(),
                  key = s3Info.path + secret,
                  url = s3Info.url + "/" + key

              for (let field in fields){
                data.append(field, fields[field])
              }

              data.append('key', key)
              data.append('file', new Blob([env]),{type:'text/plain', filename: secret})
              data.append('Content-Type', 'text/plain')

              requestQueue.push(client.post(s3Info.url + "/", data))
              updatePaths.push(["users", userId, "apps", appId, "envsWithMeta", env])
              encryptUrlQueue.push(call(encryptJson, {data: url, pubkey: user.pubkey, privkey}))
            }
          }
        }
      }
    }

    if (envParams.localKeys){
      for (let id in envParams.localKeys){
        let env = envParams.localKeys[id].env,
            localKey = yield select(getLocalKey(id)),
            s3Info = localKey.s3UploadInfo.env

        if (s3Info){
          let secret = secureRandomAlphanumeric(20),
              fields = JSON.parse(s3Info.fields),
              data = new FormData(),
              key = s3Info.path + secret,
              url = s3Info.url + "/" + key

          for (let field in fields){
            data.append(field, fields[field])
          }

          data.append('key', key)
          data.append('file', new Blob([env]),{type:'text/plain', filename: secret})
          data.append('Content-Type', 'text/plain')

          requestQueue.push(client.post(s3Info.url + "/", data))
          updatePaths.push(["localKeys", id, "env"])
          encryptUrlQueue.push(call(encryptJson, {data: url, pubkey: localKey.pubkey, privkey}))

        }
      }
    }

    if (envParams.servers){
      for (let id in envParams.servers){
        let server = yield select(getServer(id))

        for (let k of ["env", "inheritanceOverrides"]){
          let val = envParams.servers[id][k],
              s3Info = server.s3UploadInfo[k]

          if (val && s3Info){
            let secret = secureRandomAlphanumeric(20),
                fields = JSON.parse(s3Info.fields),
                data = new FormData(),
                key = s3Info.path + secret,
                url = s3Info.url + "/" + key

            for (let field in fields){
              data.append(field, fields[field])
            }

            data.append('key', key)
            data.append('file', new Blob([val]),{type:'text/plain', filename: secret})
            data.append('Content-Type', 'text/plain')

            requestQueue.push(client.post(s3Info.url + "/", data))
            updatePaths.push(["servers", id, k])
            encryptUrlQueue.push(call(encryptJson, {data: url, pubkey: server.pubkey, privkey}))
          }
        }
      }
    }

    const results = yield requestQueue,
          encryptedUrls = yield encryptUrlQueue

    for (let i = 0; i < encryptedUrls.length; i++){
      let encryptedUrl = encryptedUrls[i],
          updatePath = updatePaths[i]

      envParams = R.assocPath(updatePath, encryptedUrl, envParams)
    }

  }

  yield put(updateEnvRequest({
    ...meta,
    parentType,
    parentId,
    envActionsPending,
    skipDelay,
    envUpdateId,
    signedByTrustedPubkeys,
    updatedEnvsWithMeta: envsWithMeta,
    envs: envParams,
    envsUpdatedAt: parent.envsUpdatedAt,
    keyablesUpdatedAt: parent.keyablesUpdatedAt
  }))

  dispatchingEnvUpdateId = null
}

export function* dispatchEnvUpdateRequestIfNeeded(params){
  const {parentId} = params,
        hasPending = yield select(getHasEnvActionsPending(parentId)),
        isRequestingEnvUpdate = yield select(getIsRequestingEnvUpdate(parentId)),
        socketUserUpdatingEnvs = yield select(getSocketUserUpdatingEnvs(parentId))

  if (hasPending && !isRequestingEnvUpdate && !socketUserUpdatingEnvs){
    yield call(dispatchEnvUpdateRequest, params)
  }
}

export function* clearSubEnvServersIfNeeded({meta: {envActionsPending, parentId}}){
  const removeSubEnvActions = envActionsPending.filter(R.propEq("type", REMOVE_SUB_ENV))

  for (let {meta: {id}} of removeSubEnvActions){
    let servers = yield select(getServersForSubEnv(parentId, id))

    for (let server of servers){
      yield put(removeAssoc({parentId, parentType: "app", assocType: "server", targetId: server.id}))
    }
  }
}

export function* addDefaultSubEnvServerIfNeeded({meta: {envActionsPending, parentId}}){
  const addSubEnvActions = envActionsPending.filter(R.propEq("type", ADD_SUB_ENV))

  for (let {payload: {environment, name, id: subEnvId}} of addSubEnvActions){
    yield put(addAssoc({
      parentId,
      subEnvId,
      name: `${name} Key`,
      role: environment,
      parentType: "app",
      assocType: "server",
      skipKeygen: true,
      undeletable: true
    }))
  }
}
