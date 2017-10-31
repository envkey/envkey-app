import R from 'ramda'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,

  SOCKET_USER_UNSUBSCRIBED_OBJECT_CHANNEL,

  PROCESSED_SOCKET_UPDATE_ENVS_STATUS,

  FETCH_OBJECT_DETAILS_REQUEST,
  FETCH_OBJECT_DETAILS_SUCCESS,
  FETCH_OBJECT_DETAILS_FAILED,

  SELECTED_OBJECT,
  UPDATE_ENV_REQUEST,
  UPDATE_ENV_SUCCESS,

  SOCKET_UPDATE_LOCAL_STATUS,

  LOAD_INVITE_REQUEST,
  LOGIN,
  LOGIN_REQUEST,
  REGISTER,
  SELECT_ORG,
  LOGOUT
} from "actions"

export const

  socketIsUpdatingEnvs = (state = {}, action)=>{
    switch(action.type){
      case FETCH_OBJECT_DETAILS_REQUEST:
        if (action.meta.socketUpdate){
          return R.assoc(action.meta.targetId, action.meta.socketActorId, state)
        } else {
          return state
        }

      case FETCH_OBJECT_DETAILS_SUCCESS:
      case FETCH_OBJECT_DETAILS_FAILED:
        if (action.meta.socketUpdate){
          return R.dissoc(action.meta.targetId, state)
        } else {
          return state
        }

      case SELECT_ORG:
      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case LOAD_INVITE_REQUEST:
        return {}

      default:
        return state
    }
  },

  socketEnvsStatus = (state = {}, action)=>{
    switch(action.type){

      case PROCESSED_SOCKET_UPDATE_ENVS_STATUS:
        return R.assoc(action.meta.userId, action.payload, state)

      case SOCKET_USER_UNSUBSCRIBED_OBJECT_CHANNEL:
        return R.dissoc(action.payload.userId, state)

      case FETCH_OBJECT_DETAILS_SUCCESS:
      case FETCH_OBJECT_DETAILS_FAILED:
        if(action.meta && action.meta.socketUpdate){
          return R.pipe(
            R.dissocPath([action.meta.socketActorId, action.meta.socketEnvUpdateId]),
            R.reject(R.isEmpty)
          )(state)
        } else {
          return state
        }

      case SELECTED_OBJECT:
      case SELECT_ORG:
      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case LOAD_INVITE_REQUEST:
        return {}

      default:
        return state
    }
  },

  localSocketEnvsStatus = (state = {}, action)=>{
    switch(action.type){
      case SOCKET_UPDATE_LOCAL_STATUS:
        return action.payload

      case SELECTED_OBJECT:
      case UPDATE_ENV_REQUEST:
      case SELECT_ORG:
      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case LOAD_INVITE_REQUEST:
        return {}

      default:
        return state
    }
  },

  pendingLocalSocketEnvsStatus = (state = {}, action)=>{
    if(action.meta && action.meta.importAction){
      return state
    }

    switch(action.type){
      case CREATE_ENTRY:
        return R.assocPath([action.meta.envUpdateId, "addingEntry"], (action.payload.subEnvId || "@@__base__"), state)

      case UPDATE_ENTRY:
        return R.assocPath(
          [action.meta.envUpdateId, "editingEntry", action.payload.entryKey, action.payload.subEnvId || "@@__base__"],
          true,
          state
        )

      case REMOVE_ENTRY:
        return R.assocPath(
          [action.meta.envUpdateId, "removingEntry", action.payload.entryKey, action.payload.subEnvId || "@@__base__"],
          true,
          state
        )

      case UPDATE_ENTRY_VAL:
        return R.assocPath(
          [action.meta.envUpdateId, "editingEntryVal", action.payload.entryKey, action.payload.environment],
          true,
          state
        )

      case UPDATE_ENV_SUCCESS:
        return R.dissoc(action.meta.envUpdateId, state)

      case SELECTED_OBJECT:
      case SELECT_ORG:
      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case LOAD_INVITE_REQUEST:
        return {}

      default:
        return state
    }
  }


