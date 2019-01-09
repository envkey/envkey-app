import {isClearSessionAction} from 'envkey-client-core/dist/lib/actions'
import R from 'ramda'
import { ActionType } from 'actions'

export const

  socketIsUpdatingEnvs = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case ActionType.FETCH_OBJECT_DETAILS_REQUEST:
        if (action.meta.socketUpdate){
          return R.assoc(action.meta.targetId, action.meta.socketActorId, state)
        } else {
          return state
        }

      case ActionType.FETCH_OBJECT_DETAILS_SUCCESS:
      case ActionType.FETCH_OBJECT_DETAILS_FAILED:
        if (action.meta.socketUpdate){
          return R.dissoc(action.meta.targetId, state)
        } else {
          return state
        }

      default:
        return state
    }
  },

  socketEnvsStatus = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){

      case ActionType.PROCESSED_SOCKET_UPDATE_ENVS_STATUS:
        return R.assoc(action.meta.userId, action.payload, state)

      case ActionType.SOCKET_USER_UNSUBSCRIBED_OBJECT_CHANNEL:
        return R.dissoc(action.payload.userId, state)

      case ActionType.FETCH_OBJECT_DETAILS_SUCCESS:
      case ActionType.FETCH_OBJECT_DETAILS_FAILED:
        if(action.meta && action.meta.socketUpdate){
          return R.pipe(
            R.dissocPath([action.meta.socketActorId, action.meta.socketEnvUpdateId]),
            R.reject(R.isEmpty)
          )(state)
        } else {
          return state
        }

      case ActionType.SELECTED_OBJECT:
        return {}

      default:
        return state
    }
  },

  localSocketEnvsStatus = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case ActionType.SOCKET_UPDATE_LOCAL_STATUS:
        return action.payload

      case ActionType.SELECTED_OBJECT:
      case ActionType.UPDATE_ENV_REQUEST:
        return {}

      default:
        return state
    }
  },

  pendingLocalSocketEnvsStatus = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    if(action.meta && action.meta.importAction){
      return state
    }

    switch(action.type){
      case ActionType.CREATE_ENTRY_ROW:
        return R.assocPath([action.meta.envUpdateId, "addingEntry"], (action.payload.subEnvId || "@@__base__"), state)

      case ActionType.UPDATE_ENTRY:
        return R.assocPath(
          [action.meta.envUpdateId, "editingEntry", action.payload.entryKey, action.payload.subEnvId || "@@__base__"],
          true,
          state
        )

      case ActionType.REMOVE_ENTRY:
        return R.assocPath(
          [action.meta.envUpdateId, "removingEntry", action.payload.entryKey, action.payload.subEnvId || "@@__base__"],
          true,
          state
        )

      case ActionType.UPDATE_ENTRY_VAL:
        return R.assocPath(
          [action.meta.envUpdateId, "editingEntryVal", action.payload.entryKey, action.payload.environment],
          true,
          state
        )

      case ActionType.UPDATE_ENV_SUCCESS:
        return R.dissoc(action.meta.envUpdateId, state)

      case ActionType.SELECTED_OBJECT:
        return {}

      default:
        return state
    }
  }


