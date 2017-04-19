import R from 'ramda'
import { select, call } from 'redux-saga/effects'
import {encryptJson} from 'lib/crypto'
import {orgRoleIsAdmin} from 'lib/roles'
import {
  getUser,
  getApp,
  getServer,
  getService,
  getUsersForApp,
  getKeyableServersForApp,
  getCurrentUserEnvironmentsAssignableToAppUser,
  getCurrentUserEnvironmentAssignableToServer,
  getCurrentUserEnvironmentsAssignableToServiceUser,
  getEnvsWithMetaWithPending,
  getRawEnvWithPendingForApp,
  getAppUserBy,
  getApps,
  getServices
} from 'selectors'
import {
  ADD_ASSOC_REQUEST,
  CREATE_ASSOC_SUCCESS,
  REMOVE_ASSOC_REQUEST,
  REMOVE_OBJECT_REQUEST
} from "actions"

export function* envParamsWithAppUser({appId, userId, role, rawEnvOnly}, envParams={}){
  const {pubkey} = yield select(getUser(userId)),
        environments = yield select(getCurrentUserEnvironmentsAssignableToAppUser({appId, userId, role})),
        targetAppUser = yield select(getAppUserBy({appId, userId})),
        envs = {}

  if(targetAppUser && targetAppUser.pubkey){
    const rawEnv = yield select(getRawEnvWithPendingForApp({appId, environment: "development"}))
    envs.env = yield call(encryptJson, { data: rawEnv, pubkey: targetAppUser.pubkey })
  }

  if(pubkey && !rawEnvOnly){
    const app = yield select(getApp(appId)),
          envsWithMeta = yield select(getEnvsWithMetaWithPending("app", appId)),
          encryptedEnvsWithMeta = {}
    for (let environment of environments){
      encryptedEnvsWithMeta[environment] = yield call(encryptJson, {
        data: envsWithMeta[environment], pubkey
      })
    }
    envs.envsWithMeta = encryptedEnvsWithMeta
  }

  if(R.isEmpty(envs))return envParams
  return R.assocPath(["users", userId, "apps", appId], envs, envParams)
}

export function* envParamsWithServer({appId, serverId}, envParams={}){
  const {pubkey} = yield select(getServer(serverId)),
        environment = yield select(getCurrentUserEnvironmentAssignableToServer({appId, serverId}))
  if(!environment)return envParams
  const rawEnv = yield select(getRawEnvWithPendingForApp({appId, environment}))
  return R.assocPath(["servers", serverId], {
    env: yield call(encryptJson, { data: rawEnv, pubkey })
  }, envParams)
}

export function* envParamsWithServiceUser({serviceId, userId}, envParams={}){
  const service = yield select(getService(serviceId)),
        envsWithMeta = yield select(getEnvsWithMetaWithPending("service", serviceId)),
        {pubkey} = yield select(getUser(userId)),
        encryptedEnvsWithMeta = {},
        environments = yield select(getCurrentUserEnvironmentsAssignableToServiceUser({serviceId, userId}))

  for (let environment of environments){
    encryptedEnvsWithMeta[environment] = yield call(encryptJson, {
      data: envsWithMeta[environment], pubkey
    })
  }

  return R.assocPath(["users", userId, "services", serviceId], {
    envsWithMeta: encryptedEnvsWithMeta
  }, envParams)
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

export function* envParamsForService({serviceId}){
  const users = yield select(getUsersForService(serviceId))

  let envParams = {}

  for (let {id: userId} of users){
    envParams = yield call(envParamsWithServiceUser, {serviceId, userId}, envParams)
  }

  return envParams
}

export function *envParamsForInvitee({userId, permittedAppIds, permittedServiceIds}){
  let envParams = {}

  for (let appId of permittedAppIds){
    envParams = yield call(envParamsWithAppUser, {userId, appId}, envParams)
  }

  for (let serviceId of permittedServiceIds){
    envParams = yield call(envParamsWithServiceUser, {userId, serviceId}, envParams)
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

  const apps = yield select(getApps),
        services = yield select(getServices)

  for (let {id: appId} of apps){
    envParams = yield call(envParamsWithAppUser, {userId, appId}, envParams)
  }

  for (let {id: serviceId} of services){
    envParams = yield call(envParamsWithServiceUser, {userId, serviceId}, envParams)
  }

  return envParams
}


export function* appServiceEnvs(appId){
  const users = yield select(getUsersForApp(appId)),
        servers = yield select(getKeyableServersForApp(appId))

  let envParams = {}

  for (let {id: userId} of users){
    envParams = yield call(envParamsWithAppUser, {appId, userId, rawEnvOnly: true}, envParams)
  }

  for (let {id: serverId} of servers){
    envParams = yield call(envParamsWithServer, {appId, serverId}, envParams)
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

    switch (assocType){

      case "user":
        if(type != ADD_ASSOC_REQUEST)return action
        envParams = yield call(envParamsWithAppUser, {
          appId: app.id,
          userId: assocId,
          role: R.values(payload)[0].role
        })

        break

      case "service":
        if(![ADD_ASSOC_REQUEST, REMOVE_ASSOC_REQUEST].includes(type))return action
        envParams = yield call(appServiceEnvs, appId)
        break
    }
  }

  if(R.isEmpty(envParams)){
    return action
  } else {
    return R.assocPath(["payload", "envs"], envParams, action)
  }
}