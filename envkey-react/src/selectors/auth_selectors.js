import db from 'lib/db'
import { getUser, getAppUserBy, getServer } from './object_selectors'
import {
  getEnvironmentsAccessibleForAppUser,
  getEnvironmentsAccessibleForServiceUser,
  getAppEnvironmentsAccessible
} from './env_selectors'
import {ORG_ROLES} from 'constants'
import R from 'ramda'

export const

  getAuth = db.path("auth"),

  getPrivkey = db.path("privkey"),

  getInviteesNeedingAccess = db.path("inviteesNeedingAccess"),

  getInviteesPendingAcceptance = db.path("inviteesPendingAcceptance"),

  getIsPollingInviteesPendingAcceptance = db.path("isPollingInviteesPendingAcceptance"),

  getEnvAccessGranted = db.path("envAccessGranted"),

  getInvitedBy = db.path("invitedBy"),

  getIsOnboarding = db.path("isOnboarding"),

  getIsDemo = db.path("isDemo"),

  getEncryptedPrivkey = db.path("encryptedPrivkey"),

  getCurrentUserErr = db.path("currentUserErr"),

  getIsLoadingAppState = db.path("isFetchingCurrentUser"),

  getIsDecrypting = state => getIsDecryptingEnvs(state) || getIsDecryptingPrivkey(state),

  getIsDecryptingEnvs = db.path("isDecryptingEnvs"),

  getIsDecryptingPrivkey = db.path("isDecryptingPrivkey"),

  getIsHashingPassword = db.path("isHashingPassword"),

  getIsAuthenticating = db.path("isAuthenticating"),

  getIsAuthenticatingServer = db.path("isAuthenticatingServer"),

  getIsGeneratingUserKey = db.path("isGeneratingUserKey"),

  getEnvsAreDecrypted = db.path("envsAreDecrypted"),

  getCurrentUser = state => {
    const auth = getAuth(state)
    if(!auth)return null
    return getUser(auth.id, state)
  },

  getPermissions = db.path("permissions"),

  getCurrentAppUserForApp = (appId, state)=>{
    if(!state)return R.partial(getCurrentAppUserForApp, [appId])
    const auth = getAuth(state)
    if(!auth)return null
    return getAppUserBy({userId: auth.id, appId}, state)
  },

  getCurrentUserEnvironmentsAccessibleForApp = (appId, state)=>{
    if(!state)return R.partial(getCurrentUserEnvironmentsAccessibleForApp, [appId])
    const auth = getAuth(state)
    if(!auth)return null

    return getEnvironmentsAccessibleForAppUser({userId: auth.id, appId}, state)
  },

  getCurrentUserEnvironmentsAssignableToAppUser = ({appId, userId, role}, state)=>{
    if(!state)return R.partial(getCurrentUserEnvironmentsAssignableToAppUser, [{appId, userId, role}])

    return R.intersection(
      getCurrentUserEnvironmentsAccessibleForApp(appId, state),
      getEnvironmentsAccessibleForAppUser({appId, userId, role}, state)
    )
  },

  getCurrentUserEnvironmentAssignableToServer = ({appId, serverId}, state)=>{
    if(!state)return R.partial(getCurrentUserEnvironmentAssignableToServer, [{appId, serverId}])
    const currentUserEnvironmentsAccessible = getCurrentUserEnvironmentsAccessibleForApp(appId, state),
          appEnvironmentsAccessible = getAppEnvironmentsAccessible(state),
          server = getServer(serverId, state),
          serverEnvironment = appEnvironmentsAccessible.server[server.role]

    return currentUserEnvironmentsAccessible.includes(serverEnvironment) ?
      serverEnvironment :
      null
  },

  getCurrentUserEnvironmentsAccessibleForService = (serviceId, state)=>{
    if(!state)return R.partial(getCurrentUserEnvironmentsAccessibleForService, [serviceId])
    const auth = getAuth(state)
    if(!auth)return null

    return getEnvironmentsAccessibleForServiceUser({userId: auth.id, serviceId}, state)
  },

  getCurrentUserEnvironmentsAssignableToServiceUser = ({serviceId, userId}, state)=>{
    if(!state)return R.partial(getCurrentUserEnvironmentsAssignableToServiceUser, [{serviceId, userId}])

    return R.intersection(
      getCurrentUserEnvironmentsAccessibleForService(serviceId, state),
      getEnvironmentsAccessibleForServiceUser({serviceId, userId}, state)
    )
  },

  getOrgRolesAssignable = (userIdOrState, maybeState)=>{
    const [userId, state] = typeof userIdOrState == "string" ?
            [userIdOrState, maybeState] :
            [null, userIdOrState]

    if (userId && getUser(userId, state).role == "org_owner"){
      return ["org_owner"]
    } else {
      return R.without(["org_owner"], ORG_ROLES)
    }
  }






