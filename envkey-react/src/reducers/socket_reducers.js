import R from 'ramda'
import {
  PROCESSED_SOCKET_UPDATE_ENVS,
  SOCKET_USER_UNSUBSCRIBED_OBJECT_CHANNEL,
  PROCESSED_SOCKET_UPDATE_ENVS_STATUS,

  FETCH_OBJECT_DETAILS_SUCCESS,
  FETCH_OBJECT_DETAILS_FAILED,

  SELECTED_OBJECT,
  UPDATE_ENV_SUCCESS,

  BROADCAST_UPDATE_ENVS_STATUS
} from "actions"

const
  clearSocketStatus = {
    removingEntry: false,
    editingEntry: false,
    editingEntryVal: false,
    addingEntry: false
  },

  defaultSocketEnvsStatus = {
    removingEntry: {},
    editingEntry: {},
    editingEntryVal: {},
    addingEntry: {}
  },

  defaultLocalSocketEnvsStatus = clearSocketStatus,

  processedSocketUpdateEnvsStatusReducer = (state, action)=>{
    const payload = action.payload,
          {userId} = payload,
          res = {}

    for (let k of ["removingEntry", "editingEntry"]){
      let entryKey = payload[k]
      if (entryKey === false){
        res[k] = R.pipe(
          R.invertObj,
          R.dissoc(userId),
          R.invertObj
        )(state[k])
      } else if (entryKey){
        res[k] = R.pipe(
          R.invertObj,
          R.dissoc(userId),
          R.invertObj,
          R.assoc(entryKey, userId)
        )(state[k])
      } else {
        res[k] = state[k]
      }
    }

    for (let k of ["editingEntryVal", "addingEntry"]){
      if (payload[k] === false){
        res[k] = R.dissoc(userId, state[k])
      } else if (payload[k]){
        res[k] = R.assoc(userId, payload[k], state[k])
      } else {
        res[k] = state[k]
      }
    }

    return res
  },

  socketUserUnsubscribedObjectChannelReducer = (state, action)=>{
    const payload = action.payload,
          {userId} = payload
  }

export const

  socketIsUpdatingEnvs = (state = {}, action)=>{
    switch(action.type){
      case PROCESSED_SOCKET_UPDATE_ENVS:
        return R.assoc(action.payload.targetId, action.payload.actorId, state)

      case FETCH_OBJECT_DETAILS_SUCCESS:
      case FETCH_OBJECT_DETAILS_FAILED:
        return R.dissoc(action.meta.targetId, state)

      default:
        return state
    }
  },

  socketEnvsStatus = (state = defaultSocketEnvsStatus, action)=>{
    switch(action.type){

      case PROCESSED_SOCKET_UPDATE_ENVS_STATUS:
        return processedSocketUpdateEnvsStatusReducer(state, action)

      case SOCKET_USER_UNSUBSCRIBED_OBJECT_CHANNEL:
        return processedSocketUpdateEnvsStatusReducer(state, {
          payload: {
            ...action.payload,
            ...clearSocketStatus
          }
        })

      case FETCH_OBJECT_DETAILS_SUCCESS:
      case FETCH_OBJECT_DETAILS_FAILED:
        if(action.meta && action.meta.socketUpdate && action.meta.socketActorId){
          return processedSocketUpdateEnvsStatusReducer(state, {
            payload: {
              userId: action.meta.socketActorId,
              ...clearSocketStatus
            }
          })
        } else {
          return state
        }

      case SELECTED_OBJECT:
        return defaultSocketEnvsStatus

      default:
        return state
    }
  },

  localSocketEnvsStatus = (state = defaultLocalSocketEnvsStatus, action)=>{
    switch(action.type){
      case BROADCAST_UPDATE_ENVS_STATUS:
        return R.merge(state, action.payload)

      case SELECTED_OBJECT:
        return defaultLocalSocketEnvsStatus

      case UPDATE_ENV_SUCCESS:
        return defaultLocalSocketEnvsStatus

      default:
        return state
    }
  }
