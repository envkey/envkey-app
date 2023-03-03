import db from 'lib/db'
import {
  getUser,
  getApps,
  getAppUserBy,
  getServer,
  getLocalKeysForAppUser,
  getOrgUserForUser
} from './object_selectors'
import {
  getCurrentOrg
} from './org_selectors'
import {
  getEnvironmentsAccessibleForAppUser,
  getEnvironmentsAssignableForAppUser,
  getAppEnvironmentsAccessible,
  getAppEnvironmentsAssignable,
  getSubEnvs
} from './env_selectors'
import {getIsInvitee} from './invite_selectors'
import {ORG_ROLES} from 'constants'
import R from 'ramda'
import {camelize} from 'xcase'

db.init("accounts")

export const
  getAppLoaded = db.path("appLoaded"),

  getDisconnected = db.path("disconnected"),

  getVerifyingEmail = db.path("verifyingEmail"),

  getEmailVerificationCode = db.path("emailVerificationCode"),

  getEmailVerificationType = db.path("emailVerificationType"),

  getIsVerifyingEmail = db.path("isVerifyingEmail"),

  getIsVerifyingEmailCode = db.path("isVerifyingEmailCode"),

  getVerifyEmailError = db.path("verifyEmailError"),

  getVerifyEmailCodeError = db.path("verifyEmailCodeError"),

  getAuth = db.path("auth"),

  getAuthError = db.path("authError"),

  getIsOnboarding = (state)=> getApps(state).length == 1 || getIsInvitee(state),

  getCurrentUserErr = db.path("currentUserErr"),

  getIsLoadingAppState = db.path("isFetchingCurrentUser"),

  getIsHashingPassword = db.path("isHashingPassword"),

  getIsAuthenticating = db.path("isAuthenticating"),

  getIsAuthenticatingServer = db.path("isAuthenticatingServer"),

  getOrgRolesInvitable = db.path("orgRolesInvitable"),

  getLastFetchAt = db.path("lastFetchAt"),

  getCurrentUser = state => {
    const auth = getAuth(state)
    if(!auth)return null
    return getUser(auth.id, state)
  },

  getAccounts = db.accounts.list(),

  getAccount = db.accounts.find(),

  getCurrentOrgUser = state => getOrgUserForUser(getAuth(state).id, state),

  getPermissions = db.path("permissions"),

  getCurrentAppUserForApp = R.curry((appId, state)=>{
    const auth = getAuth(state)
    if(!auth)return null
    return getAppUserBy({userId: auth.id, appId}, state)
  }),

  getCurrentUserEnvironmentsAccessibleForApp = R.curry((appId, state)=>{
    const auth = getAuth(state)
    if(!auth)return null

    return getEnvironmentsAccessibleForAppUser({userId: auth.id, appId}, state)
  }),

  getCurrentUserEnvironmentsAssignableForApp = R.curry((appId, state)=>{
    const auth = getAuth(state)
    if(!auth)return null

    return getEnvironmentsAssignableForAppUser({userId: auth.id, appId}, state)
  }),

  getCurrentUserEnvironmentsAssignableToAppUser = R.curry(({appId, userId, role}, state)=>{
    const assignable = getCurrentUserEnvironmentsAssignableForApp(appId, state),
          accessible = getEnvironmentsAccessibleForAppUser({appId, userId, role}, state)

    return R.intersection(assignable, accessible)
  }),

  getCurrentUserEnvironmentAssignableToServer = R.curry(({appId, serverId}, state)=>{
    const currentUserEnvironmentsAssignable = getCurrentUserEnvironmentsAssignableForApp(appId, state),
          appEnvironmentsAccessible = getAppEnvironmentsAccessible(state),
          server = getServer(serverId, state),
          serverEnvironment = appEnvironmentsAccessible.server[server.role]

    return currentUserEnvironmentsAssignable.includes(serverEnvironment) ?
      serverEnvironment :
      null
  }),


  getOrgRolesAssignable = (userIdOrState, maybeState)=>{
    const [userId, state] = typeof userIdOrState == "string" ?
            [userIdOrState, maybeState] :
            [null, userIdOrState]

    if (userId && getUser(userId, state).role == "org_owner"){
      return ["org_owner"]
    } else {
      return R.without(["org_owner"], ORG_ROLES)
    }
  },

  getEnvironmentsAccessible = R.curry((appId, state)=>{
    const environments = getCurrentAppUserForApp(appId, state).environmentsAccessible

    return environments.map(s => camelize(s))
  }),

  getEnvironmentLabels = R.curry((appId, state)=>{
    // const environmentsAccessible = getEnvironmentsAccessible(appId, state)
    // return R.without(["productionMetaOnly"], environmentsAccessible)

    return ["development", "staging", "production"]
  }),

  getEnvironmentsAccessibleWithSubEnvs = R.curry((appId, state)=>{
    return getEnvironmentsAccessible(appId, state).concat(getSubEnvs(appId, state))
  }),

  getEnvironmentLabelsWithSubEnvs = R.curry((appId, state)=>{
    return getEnvironmentLabels(appId, state).concat(getSubEnvs(appId, state))
  }),

  getCurrentUserLocalKeysForApp = R.curry((appId, state)=> {
    const {id: userId} = getCurrentUser(state),
          {id: appUserId} = getAppUserBy({userId, appId}, state)
    return getLocalKeysForAppUser(appUserId, state)
  }),

  getAllowedIpsMergeStrategies = db.path("allowedIpsMergeStrategies"),

  getResetAccountOptions = db.path("resetAccountOptions"),

  getIsDemo = R.anyPass([
    db.path("isDemo"),
    R.pipe(getCurrentUser, R.path(['demo'])),
    R.pipe(getCurrentOrg, R.path(['demo']))
  ]),

  getDemoDownloadUrl = db.path("demoDownloadUrl")





