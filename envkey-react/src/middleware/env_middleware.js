import R from 'ramda'
import {
  TRANSFORM_ENV_ACTION_TYPES,
  ATTACH_ENV_UPDATE_ID_TYPES
} from 'envkey-client-core/dist/types'
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