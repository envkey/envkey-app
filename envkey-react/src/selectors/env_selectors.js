import { defaultMemoize } from 'reselect'
import db from 'lib/db'
import {
  getApp,
  getUser,
  getAppUserBy,
  getObject,
  getSelectedObjectId
} from './object_selectors'
import {getImportActionsPending} from './import_selectors'
import {rawEnv, transformEnv} from 'lib/env/transform'
import {allSubEnvsSorted} from 'lib/env/query'
import R from 'ramda'
import {camelize} from 'xcase'

export const

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

  getRawEnvWithPendingForApp = R.curry((opts, state)=> {
    const
      {appId, environment} = opts,

      app = getApp(appId, state),

      envsWithMeta = getEnvsWithMetaWithPending("app", app.id, state)

    return rawEnv({envsWithMeta, environment})
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

  getSubEnvs = R.curry((appId, state)=>{
    const envsWithMeta = getApp(appId, state).envsWithMeta
    return allSubEnvsSorted(envsWithMeta)
  })