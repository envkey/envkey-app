import R from 'ramda'
import { select, call } from 'redux-saga/effects'
import {encryptJson, signPublicKey} from 'lib/crypto'
import {orgRoleIsAdmin} from 'lib/roles'
import {keyableIsTrusted} from './crypto_helpers'
import {
  getUser,
  getApp,
  getServer,
  getUsersForApp,
  getServersWithPubkeyForApp,
  getLocalKey,
  getLocalKeysWithPubkeyForApp,
  getCurrentUser,
  getCurrentUserEnvironmentsAssignableToAppUser,
  getCurrentUserEnvironmentAssignableToServer,
  getEnvsWithMetaWithPending,
  getRawEnvWithPendingForApp,
  getAppUserBy,
  getApps,
  getPrivkey
} from 'selectors'
import {productionInheritanceOverrides} from 'lib/env/inheritance'
import {
  ADD_ASSOC_REQUEST,
  CREATE_ASSOC_SUCCESS,
  REMOVE_ASSOC_REQUEST,
  REMOVE_OBJECT_REQUEST
} from "actions"

export function* envParamsWithAppUser({
  appId,
  userId,
  role,
  withTrustedPubkey,
  isAcceptingInvite=false
}, envParams={}){

  const privkey = yield select(getPrivkey),
        user = yield select(getUser(userId)),
        pubkey = withTrustedPubkey || user.pubkey || user.invitePubkey,
        environments = yield select(getCurrentUserEnvironmentsAssignableToAppUser({appId, userId, role})),
        targetAppUser = yield select(getAppUserBy({appId, userId})),
        envs = {}

  // Make productionMetaOnly assignable for a dev user when accepting an invitation
  if(isAcceptingInvite && !environments.includes("productionMetaOnly")){
    environments.push("productionMetaOnly")
  }

  if(pubkey && (withTrustedPubkey || (yield call(keyableIsTrusted, user)))){
    const app = yield select(getApp(appId)),
          envsWithMeta = yield select(getEnvsWithMetaWithPending("app", appId)),
          encryptedEnvs = yield environments.map(environment => encryptJson({data: envsWithMeta[environment], pubkey, privkey}))

    envs.envsWithMeta = R.zipObj(environments, encryptedEnvs)
  }

  if(R.isEmpty(envs))return envParams
  return R.assocPath(["users", userId, "apps", appId], envs, envParams)
}

export function* envParamsWithServer({appId, serverId}, envParams={}){
  const privkey = yield select(getPrivkey),
        server = yield select(getServer(serverId)),
        {pubkey, role: serverRole} = server,
        environment = yield select(getCurrentUserEnvironmentAssignableToServer({appId, serverId}))

  if(!(yield call(keyableIsTrusted, server))) return envParams

  if (environment){
    const rawEnv = yield select(getRawEnvWithPendingForApp({appId, environment}))
    return R.assocPath(["servers", serverId], {
      env: yield encryptJson({data: rawEnv, pubkey, privkey })
    }, envParams)
  } else {
    const {role: appRole} =  yield select(getApp(appId))
    if (appRole == "development" && serverRole == "production"){

      const envsWithMeta = yield select(getEnvsWithMetaWithPending("app", appId)),
            inheritanceOverrides = productionInheritanceOverrides(envsWithMeta)

      if (R.isEmpty(inheritanceOverrides)){
        return envParams
      } else {
        return R.assocPath(["servers", serverId], {
          inheritanceOverrides: yield encryptJson({ data: inheritanceOverrides, pubkey, privkey})
        }, envParams)
      }
    } else {
      return envParams
    }
  }
}

export function* envParamsWithLocalKey({appId, localKeyId}, envParams={}){
  const privkey = yield select(getPrivkey),
        localKey = yield select(getLocalKey(localKeyId)),
        {pubkey, role: localKeyRole} = localKey,
        environment = "development"

  if(!(yield call(keyableIsTrusted, localKey))) return envParams

  const rawEnv = yield select(getRawEnvWithPendingForApp({appId, environment}))
  return R.assocPath(["localKeys", localKeyId], {
    env: yield encryptJson({data: rawEnv, pubkey, privkey })
  }, envParams)
}


export function* envParamsForApp({appId}){
  const
    users = yield select(getUsersForApp(appId)),
    servers = yield select(getServersWithPubkeyForApp(appId)),
    localKeys = yield select(getLocalKeysWithPubkeyForApp(appId)),

    userGenerators = users.map(({id: userId})=> call(envParamsWithAppUser, {appId, userId})),

    serverGenerators = servers.map(({id: serverId})=> call(envParamsWithServer, {appId, serverId})),

    localKeyGenerators = localKeys.map(({id: localKeyId})=> call(envParamsWithLocalKey, {appId, localKeyId})),

    allGenerators = userGenerators.concat(serverGenerators, localKeyGenerators),

    allParams = yield allGenerators,

    merged = allParams.reduce(R.mergeDeepRight)

  return merged
}

export function *envParamsForInvitee({userId, permittedAppIds}){
  const generators = permittedAppIds.map(appId => call(envParamsWithAppUser, {userId, appId})),
        allParams = yield generators,
        merged = allParams.reduce(R.mergeDeepRight)

  return { envs: merged }
}

export function *envParamsForAcceptedInvite(withTrustedPubkey){
  const {id: userId} = yield select(getCurrentUser),
        apps = yield select(getApps),
        generators = apps.map(({id: appId})=> call(envParamsWithAppUser, {userId, appId, withTrustedPubkey, isAcceptingInvite: true})),
        allParams = yield generators,
        merged = allParams.reduce(R.mergeDeepRight)

  return merged
}

export function *envParamsForUpdateOrgRole({userId, role: newRole}){
  const {orgRole: currentRole} = yield select(getUser(userId)),

        isCurrentAdmin = orgRoleIsAdmin(currentRole),

        isUpdatingToAdmin = orgRoleIsAdmin(newRole),

        isUpdatingNonAdminToAdmin = !isCurrentAdmin && isUpdatingToAdmin

  if (!isUpdatingNonAdminToAdmin) return {}

  const apps = yield select(getApps),
        generators = apps.map(({id: appId})=> call(envParamsWithAppUser, {userId, appId})),
        allParams = yield generators,
        merged = allParams.reduce(R.mergeDeepRight)

  return merged
}

export function* attachAssocEnvs(action){
  let envParams

  const {
    meta: { parentType, assocType, parentId, assocId, targetId },
    payload,
    type
  } = action

  if (parentType == "app"){
    const appId = parentId,
          app = yield(select(getApp(parentId)))

    if(type != ADD_ASSOC_REQUEST)return action
    envParams = yield call(envParamsWithAppUser, {
      appId: app.id,
      userId: assocId,
      role: R.values(payload)[0].role
    })
  }

  if(R.isEmpty(envParams)){
    return action
  } else {
    return R.assocPath(["payload", "envs"], envParams, action)
  }
}