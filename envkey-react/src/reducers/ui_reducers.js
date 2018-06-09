import { isClearSessionAction } from "envkey-client-core/reducers/helpers"
import {
  APP_LOADED,
  DISCONNECTED,
  START_DEMO,
  SET_DEMO_DOWNLOAD_URL,
  ACCEPT_INVITE_SUCCESS
} from "actions"


export const
  appLoaded = (state = false, action)=> {
    if (action.type == APP_LOADED){
      return true
    } else {
      return state
    }
  },

  disconnected = (state = false, action)=> {
    // don't flip back to false on reconnect, just do a hard refresh
    if (action.type === DISCONNECTED){
      return true
    }
    return state
  },

  isDemo = (state = false, {type})=> type == START_DEMO ? true : state,

  demoDownloadUrl = (state = null, {type, payload})=> {
    return type == SET_DEMO_DOWNLOAD_URL ? payload : state
  },

  selectedObjectType = (state=null, action)=>{
    if (isClearSessionAction(action)){
      return null
    }

    switch(action.type){
      case SELECTED_OBJECT:
        return action.payload.objectType || null

      default:
        return state
    }
  },

  selectedObjectId = (state=null, action)=>{
    if (isClearSessionAction(action)){
      return null
    }

    switch(action.type){
      case SELECTED_OBJECT:
        return action.payload.id || null

      default:
        return state
    }
  },

  isInvitee = (state = false, action)=>{
    if (isClearSessionAction(action)){
      return false
    }

    switch (action.type){
      case ACCEPT_INVITE_SUCCESS:
        return true

      default:
        return state
    }
  }


