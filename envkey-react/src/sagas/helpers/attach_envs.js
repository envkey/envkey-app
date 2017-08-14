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
  getKeyableServersForApp,
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
  rawEnvOnly,
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

  if(targetAppUser && targetAppUser.pubkey && (yield call(keyableIsTrusted, targetAppUser))){
    const rawEnv = yield select(getRawEnvWithPendingForApp({appId, environment: "development"}))
    envs.env = yield encryptJson({ data: rawEnv, pubkey: targetAppUser.pubkey, privkey })
  }

  if(pubkey && !rawEnvOnly && (withTrustedPubkey || (yield call(keyableIsTrusted, user)))){
    const app = yield select(getApp(appId)),
          envsWithMeta = yield select(getEnvsWithMetaWithPending("app", appId)),
          encryptedEnvsWithMeta = {}

    for (let environment of environments){
      encryptedEnvsWithMeta[environment] = yield encryptJson({
        data: envsWithMeta[environment], pubkey, privkey
      })
    }
    envs.envsWithMeta = encryptedEnvsWithMeta
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

export function* envParamsForApp({appId}){
  const users = yield select(getUsersForApp(appId)),
        servers = yield select(getKeyableServersForApp(appId))

  let envParams = {}

  for (let {id: userId} of users){
    envParams = yield call(envParamsWithAppUser, {appId, userId}, envParams)
  }

  for (let {id: serverId} of servers){
    envParams = yield call(envParamsWithServer, {appId, serverId}, envParams)
  }

  return envParams
}

export function *envParamsForInvitee({userId, permittedAppIds}){
  let envParams = {}

  for (let appId of permittedAppIds){
    envParams = yield call(envParamsWithAppUser, {userId, appId}, envParams)
  }

  return { envs: envParams }
}

export function *envParamsForAcceptedInvite(withTrustedPubkey){
  let envParams = {}

  const {id: userId} = yield select(getCurrentUser),
        apps = yield select(getApps)

  for (let {id: appId} of apps){
    envParams = yield call(envParamsWithAppUser, {userId, appId, withTrustedPubkey, isAcceptingInvite: true}, envParams)
  }

  return envParams
}

export function *envParamsForUpdateOrgRole({userId, role: newRole}){
  const {orgRole: currentRole} = yield select(getUser(userId)),

        isCurrentAdmin = orgRoleIsAdmin(currentRole),

        isUpdatingToAdmin = orgRoleIsAdmin(newRole),

        isUpdatingNonAdminToAdmin = !isCurrentAdmin && isUpdatingToAdmin

  if (!isUpdatingNonAdminToAdmin) return {}

  let envParams = {}

  const apps = yield select(getApps)

  for (let {id: appId} of apps){
    envParams = yield call(envParamsWithAppUser, {userId, appId}, envParams)
  }

  return envParams
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