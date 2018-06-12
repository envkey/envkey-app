import R from 'ramda'
import {
  UPDATE_ENV_STATUS,
  TRANSFORM_ENV_ACTION_TYPES,
  ATTACH_ENV_UPDATE_ID_TYPES
} from 'actions'
import {
  UPDATE_ENVS_STATUS
} from 'lib/socket'

import {
  getSelectedObject,
  getSocketUserUpdatingEnvs
 } from 'selectors'

 const attachEnvUpdateIdTypes = [
    ...ATTACH_ENV_UPDATE_ID_TYPES,
    UPDATE_ENVS_STATUS
 ]

export const

  attachEnvUpdateId = store => next => action => {
    if (attachEnvUpdateIdTypes.includes(action.type) && !R.path(["meta", "envUpdateId"], action)){
      const state = store.getState(),
            selectedObject = getSelectedObject(state)

      if (!selectedObject){
        return next(action)
      }

      const envUpdateId = R.path(["envUpdateId", selectedObject.id], state)

      return next(R.assocPath(["meta", "envUpdateId"], envUpdateId, action))
    }

    return next(action)
  },

  resolveEnvsCommitLocked = store => next => action => {
    if (TRANSFORM_ENV_ACTION_TYPES.includes(action.type) && !R.path(["meta", "envsCommitLocked"], action)){
      const state = store.getState(),
            parentId = R.path(["meta", "parentId"], action) || R.prop("id", getSelectedObject(state))

      if (!parentId){
        return next(action)
      }

      const socketUserUpdatingEnvs = getSocketUserUpdatingEnvs(parentId, state)

      if (socketUserUpdatingEnvs){
        return next(R.assocPath(["meta", "envsCommitLocked"], true, action))
      }
    }

    return next(action)
  }