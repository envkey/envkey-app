import { createSelector, defaultMemoize } from 'reselect'
import db from 'lib/db'
import {
  getApp,
  getUser,
  getService,
  getServicesForApp,
  getAppsForService,
  getAppUserBy,
  getObject,
  getSelectedObjectId
} from './object_selectors'
import {getImportActionsPending} from './import_selectors'
import {rawEnv, transformEnv} from 'lib/env/transform'
import {allKeys} from 'lib/env/query'
import R from 'ramda'
import {camelize} from 'xcase'

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

  getEntries = defaultMemoize(allKeys),

  getHasAnyVal = defaultMemoize(R.pipe(
    R.values,
    R.map(R.values),
    R.flatten,
    R.any(R.prop('val'))
  )),

  getEnvActionsPendingByEnvUpdateId = R.curry((parentId, envUpdateId, state) => {
    return db.path("envActionsPending", parentId, envUpdateId)(state) || []
  }),

  getAllEnvActionsPending = R.curry((parentId, state)=> {
    const pending = db.path("envActionsPending", parentId)(state)
    return R.pipe(R.values, R.flatten)(pending)
  }),

  getHasEnvActionsPending = R.curry((parentId, state) => {
    return getAllEnvActionsPending(parentId, state).length > 0
  }),

  getIsRequestingEnvUpdate = R.curry((id, state)=>{
    return db.path("isRequestingEnvUpdate", id)(state) || false
  }),

  getIsUpdatingOutdatedEnvs = R.curry((id, state)=>{
    return db.path("isUpdatingOutdatedEnvs", id)(state) || false
  }),

  getIsRebasingOutdatedEnvs = R.curry((id, state)=>{
    return db.path("isRebasingOutdatedEnvs", id)(state) || false
  }),

  getEnvUpdateId = R.curry((id, state) => {
    return db.path("envUpdateId", id)(state)
  }),

  getSelectedParentEnvUpdateId = state =>{
    return getEnvUpdateId(getSelectedObjectId(state), state)
  },

  getLastAddedEntry = (parentId, state)=> db.path("lastAddedEntry", parentId)(state),

  getAppEnvironmentsAccessible = db.path("appEnvironmentsAccessible"),

  getAppEnvironmentsAssignable = db.path("appEnvironmentsAssignable"),

  getEnvsWithMetaWithPending = defaultMemoize(R.curry((parentType, parentId, state)=>{
    const parent = getObject(parentType, parentId, state),
          pendingActions = getAllEnvActionsPending(parentId, state)

    return pendingActions.reduce(transformEnv, parent.envsWithMeta)
  })),

  getEnvsWithMetaWithPendingWithImports = defaultMemoize(R.curry((parentType, parentId, state)=>{
    const envsWithMeta = getEnvsWithMetaWithPending(parentType, parentId, state),
          pendingActions = getImportActionsPending(parentId, state)

    return pendingActions.reduce(transformEnv, envsWithMeta)
  })),

  getHasPendingEnvsWithMeta = R.curry((id, state)=> {
    return Boolean(R.path(["envsPending", id], state))
  }),

  getRawEnvShallowWithPending = R.curry((opts, state)=>{
    return rawEnv({
      envsWithMeta: getEnvsWithMetaWithPending(opts, state),
      environment: opts.environment
    })
  }),

  getRawEnvWithPendingForApp = R.curry((opts, state)=> {
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

      appEnvsWithMeta = getEnvsWithMetaWithPending("app", app.id, state),

      allEnvsWithMeta = R.pipe(
        R.map(service => getEnvsWithMetaWithPending("service", service.id, state)),
        R.append(appEnvsWithMeta),
        R.reject(R.isEmpty)
      )(services)

    return allEnvsWithMeta.reduce((acc, envsWithMeta)=> {
      return {...acc, ...rawEnv({envsWithMeta, environment})}
    }, {})
  }),

  getEnvironmentsAccessibleForAppUser = R.curry(({appId, userId, role}, state)=>{
    let environments
    const appEnvironmentsAccessible = getAppEnvironmentsAccessible(state)
    if(role){
      environments = appEnvironmentsAccessible.user[role]
    } else {
      const appUser = getAppUserBy({userId, appId}, state)
      if(!appUser)return []
      environments = appEnvironmentsAccessible.user[appUser.role]
    }

    return environments.map(s => camelize(s))
  }),

  getEnvironmentsAssignableForAppUser = R.curry(({appId, userId, role}, state)=>{
    let environments
    const appEnvironmentsAssignable = getAppEnvironmentsAssignable(state)
    if(role){
      environments = appEnvironmentsAssignable.user[role]
    } else {
      const appUser = getAppUserBy({userId, appId}, state)
      if(!appUser)return []
      environments = appEnvironmentsAssignable.user[appUser.role]
    }

    return environments.map(s => camelize(s))
  }),

  getEnvironmentsAccessibleForServiceUser = R.curry(({serviceId, userId}, state)=>{
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
  })