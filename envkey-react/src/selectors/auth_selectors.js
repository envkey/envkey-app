import db from 'lib/db'
import { getUser, getAppUserBy, getServer } from './object_selectors'
import {
  getEnvironmentsAccessibleForAppUser,
  getEnvironmentsAssignableForAppUser,
  getEnvironmentsAccessibleForServiceUser,
  getAppEnvironmentsAccessible,
  getAppEnvironmentsAssignable
} from './env_selectors'
import {ORG_ROLES} from 'constants'
import R from 'ramda'
import {camelize} from 'xcase'

export const

  getAuth = db.path("auth"),

  getIsOnboarding = (state)=> db.path("hasSingleApp")(state) || getIsInvitee(state),

  getIsDemo = db.path("isDemo"),

  getCurrentUserErr = db.path("currentUserErr"),

  getIsLoadingAppState = db.path("isFetchingCurrentUser"),

  getIsHashingPassword = db.path("isHashingPassword"),

  getIsAuthenticating = db.path("isAuthenticating"),

  getIsAuthenticatingServer = db.path("isAuthenticatingServer"),

  getOrgRolesInvitable = db.path("orgRolesInvitable"),

  getCurrentUser = state => {
    const auth = getAuth(state)
    if(!auth)return null
    return getUser(auth.id, state)
  },

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

  getCurrentUserEnvironmentsAccessibleForService = R.curry((serviceId, state)=>{
    const auth = getAuth(state)
    if(!auth)return null

    return getEnvironmentsAccessibleForServiceUser({userId: auth.id, serviceId}, state)
  }),

  getCurrentUserEnvironmentsAssignableForParent = R.curry((parentType, parentId, state)=>{
    if (parentType == "app"){
      return getCurrentUserEnvironmentsAssignableForApp(parentId, state)
    } else if (parentType == "service"){
      return getCurrentUserEnvironmentsAssignableForService(parentId, state)
    }
  }),

  getCurrentUserEnvironmentsAssignableToServiceUser = R.curry(({serviceId, userId}, state)=>{
    return R.intersection(
      getCurrentUserEnvironmentsAccessibleForService(serviceId, state),
      getEnvironmentsAccessibleForServiceUser({serviceId, userId}, state)
    )
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

  getEnvironmentsAccessible = R.curry((parentType, parentId, state)=>{
    const environments = parentType == "app" ?
      getCurrentAppUserForApp(parentId, state).environmentsAccessible :
      getCurrentUser(state).permittedServiceEnvironments

    return environments.map(s => camelize(s))
  }),

  getEnvironmentLabels = R.curry((parentType, parentId, state)=>{
    // const environmentsAccessible = getEnvironmentsAccessible(parentType, parentId, state)
    // return R.without(["productionMetaOnly"], environmentsAccessible)

    return ["development", "staging", "production"]
  })





