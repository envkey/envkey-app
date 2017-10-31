import R from 'ramda'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,
  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
  RENAME_SUB_ENV,
  UPDATE_ENV_STATUS,
  UPDATE_ENV_SUCCESS
} from 'actions'
import {
  getEnvActionsPendingByEnvUpdateId,
  getSelectedObject
 } from 'selectors'

const attachEnvUpdateIdTypes = [
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,
  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
  RENAME_SUB_ENV,
  UPDATE_ENV_STATUS
]

export const

  attachEnvUpdateId = store => next => action => {
    if (attachEnvUpdateIdTypes.includes(action.type) && !R.path(["meta", "envUpdateId"], action)){
      const state = store.getState(),
            parentId = R.path(["meta", "parentId"], action) || getSelectedObject(state).id,
            envUpdateId = R.path(["envUpdateId", parentId], state)
      return next(R.assocPath(["meta", "envUpdateId"], envUpdateId, action))
    }

    return next(action)
  },

  updateEnvSuccessCheckPending = store => next => action => {
    if (action.type == UPDATE_ENV_SUCCESS){
      const {parentId, envUpdateId} = action.meta,
            envActionsPending = getEnvActionsPendingByEnvUpdateId(parentId, store.getState())
      if(R.keys(envActionsPending).length == 2){
        return next(R.assocPath(["meta", "hasMoreUpdatesPending"], true, action))
      }
    }

    return next(action)
  }