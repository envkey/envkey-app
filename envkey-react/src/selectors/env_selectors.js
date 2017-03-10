import { createSelector, defaultMemoize } from 'reselect'
import db from 'lib/db'
import {
  getApp,
  getUser,
  getService,
  getServicesForApp,
  getAppsForService,
  getAppUserBy
} from './object_selectors'
import {rawEnv} from 'lib/env/transform'
import R from 'ramda'

const
  getRemoveServiceIdsPendingForApp = (appId, state)=>{
    const removeServiceIdsForApp = R.path(["envsPending", appId, "removeServiceIds"], state) || [],
          removeServiceIdsGlobal = R.path(["envsPending", "removeServiceIds"], state) || []

    return removeServiceIdsForApp.concat(removeServiceIdsGlobal)
  },

  getAddServiceIdsPendingForApp = (appId, state)=>{
    return R.path(["envsPending", appId, "addServiceIds"], state) || []
  }

export const
  getEntries = defaultMemoize(R.pipe(
    R.values,
    R.head,
    R.keys,
    R.sort(R.ascend(R.identity))
  )),

  getAppEnvironmentsAccessible = db.path("appEnvironmentsAccessible"),

  getEnvsWithMetaWithPending = (opts, state)=> {
    if(!state)return R.partial(getEnvsWithMetaWithPending, [opts])
    const {parent, parentType} = opts,
          pending = R.path(["envsPending", parent.id, "envsWithMeta"], state)

    return pending || parent.envsWithMeta || {}
  },

  getRawEnvShallowWithPending = (opts, state)=>{
    if(!state)return R.partial(getRawEnvShallowWithPending, [opts])
    return rawEnv({
      envsWithMeta: getEnvsWithMetaWithPending(opts, state),
      environment: opts.environment
    })
  },

  getRawEnvWithPendingForApp = (opts, state)=> {
    if(!state)return R.partial(getRawEnvWithPendingForApp, [opts])

    const
      {appId, environment} = opts,

      app = getApp(appId, state),

      addServiceIds = getAddServiceIdsPendingForApp(appId, state),

      addServices = addServiceIds.map(id => getService(id, state)),

      removeServiceIds = new Set(getRemoveServiceIdsPendingForApp(appId, state)),

      services = R.pipe(
        getServicesForApp(appId),
        R.reject(R.pathSatisfies(id => removeServiceIds.has(id),['relation','id'])),
        R.concat(addServices)
      )(state),

      appEnvsWithMeta = getEnvsWithMetaWithPending({parentType: "app", parent: app}, state),

      allEnvsWithMeta = R.pipe(
        R.map(service => getEnvsWithMetaWithPending({parentType: "service", parent: service}, state)),
        R.append(appEnvsWithMeta),
        R.reject(R.isEmpty)
      )(services)

    return allEnvsWithMeta.reduce((acc, envsWithMeta)=> {
      return {...acc, ...rawEnv({envsWithMeta, environment})}
    }, {})
  },

  getEnvironmentsAccessibleForAppUser = ({appId, userId, role}, state)=>{
    if(!state)return R.partial(getEnvironmentsAccessibleForAppUser, [{appId, userId}])

    const appEnvironmentsAccessible = getAppEnvironmentsAccessible(state)
    if(role)return appEnvironmentsAccessible.user[role]

    const appUser = getAppUserBy({userId, appId}, state)
    if(!appUser)return []
    return appEnvironmentsAccessible.user[appUser.role]
  },

  getEnvironmentsAccessibleForServiceUser = ({serviceId, userId}, state)=>{
    if(!state)return R.partial(getEnvironmentsAccessibleForServiceUser, [serviceId, userId])

    const appEnvironmentsAccessible = getAppEnvironmentsAccessible(state),
          apps = getAppsForService(serviceId, state),
          appIds = new Set(R.pluck("id", apps)),
          appUsers = db("appUsers").where({userId, appId: appId => appIds.has(appId)})(state),
          user = getUser(userId, state)

    return R.pipe(
      R.map(appUser => getEnvironmentsAccessibleForAppUser(appUser, state)),
      R.append(user.permittedServiceEnvironments),
      R.flatten,
      R.uniq
    )(appUsers)
  }