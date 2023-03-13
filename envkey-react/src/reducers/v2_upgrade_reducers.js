import {
  START_V2_UPGRADE,
  START_V2_UPGRADE_REQUEST,
  START_V2_UPGRADE_REQUEST_SUCCESS,
  START_V2_UPGRADE_REQUEST_FAILED,
  START_V2_UPGRADE_SUCCESS,
  START_V2_UPGRADE_FAILED,
  CANCEL_V2_UPGRADE,
  CANCEL_V2_UPGRADE_SUCCESS,
  CANCEL_V2_UPGRADE_FAILED,
  FINISH_V2_UPGRADE,
  FINISH_V2_UPGRADE_SUCCESS,
  FINISH_V2_UPGRADE_FAILED,
  EXPORT_ORG_SUCCESS,
  CHECK_V2_CORE_PROC_ALIVE_SUCCESS,
  CHECK_V2_CORE_PROC_ALIVE_FAILED,
  V2_CORE_PROC_LOAD_UPGRADE,
  V2_CORE_PROC_LOAD_UPGRADE_SUCCESS,
  V2_CORE_PROC_LOAD_UPGRADE_FAILED,
  V2_UPGRADE_GENERATE_ENVKEYS,
  V2_UPGRADE_GENERATE_ENVKEYS_SUCCESS,
  V2_UPGRADE_GENERATE_ENVKEYS_FAILED,
  CHECK_V2_UPGRADE_STATUS,
  CHECK_V2_UPGRADE_STATUS_SUCCESS,
  CHECK_V2_UPGRADE_STATUS_FAILED,
  START_V2_ORG_USER_UPGRADE,
  START_V2_ORG_USER_UPGRADE_SUCCESS,
  START_V2_ORG_USER_UPGRADE_FAILED,
  FINISH_V2_ORG_USER_UPGRADE,
  FINISH_V2_ORG_USER_UPGRADE_SUCCESS,
  FINISH_V2_ORG_USER_UPGRADE_FAILED,
  V2_UPGRADE_ACCEPT_INVITE,
  V2_UPGRADE_ACCEPT_INVITE_SUCCESS,
  V2_UPGRADE_ACCEPT_INVITE_FAILED,
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS
} from "actions"
import {isFetchCurrentUserAction, isClearSessionAction} from './helpers'
import { camelizeKeys } from 'xcase'

export const

   isStartingV2Upgrade = (state=false, action)=>{


      if (isClearSessionAction(action)){
        return false
      }

     switch(action.type){

       case START_V2_UPGRADE:
       case START_V2_ORG_USER_UPGRADE:
         return true

       case START_V2_UPGRADE_SUCCESS:
       case START_V2_UPGRADE_FAILED:
       case START_V2_ORG_USER_UPGRADE_SUCCESS:
       case START_V2_ORG_USER_UPGRADE_FAILED:
       case CANCEL_V2_UPGRADE:
         return false

       default:
         return state

     }
   },

   didResumeV2Upgrade = (state=false, action)=>{
      if (isClearSessionAction(action)){
        return false
      }

     switch(action.type){

       case START_V2_UPGRADE:
         return (action.payload && action.payload.resume) || false

       case START_V2_UPGRADE_SUCCESS:
       case START_V2_UPGRADE_FAILED:
       case CANCEL_V2_UPGRADE:
         return false

       default:
         return state

     }
   },

   isCancelingV2Upgrade = (state=false, action)=>{


      if (isClearSessionAction(action)){
        return false
      }

     switch(action.type){

       case CANCEL_V2_UPGRADE:
         return true

       case CANCEL_V2_UPGRADE_SUCCESS:
       case CANCEL_V2_UPGRADE_FAILED:
         return false

       default:
         return state

     }
   },

   canceledV2Upgrade = (state=false, action)=>{

      if (isClearSessionAction(action)){
        return false
      }

     switch(action.type){

       case CANCEL_V2_UPGRADE:
         return true

       case START_V2_UPGRADE:
       case START_V2_ORG_USER_UPGRADE:
         return false

       default:
         return state

     }
   },

   isFinishingV2Upgrade = (state=false, action)=>{
      if (isClearSessionAction(action)){
        return false
      }

     switch(action.type){

       case FINISH_V2_UPGRADE:
         return true

       case FINISH_V2_UPGRADE_SUCCESS:
       case FINISH_V2_UPGRADE_FAILED:
         return false

       default:
         return state

     }
   },

   didFinishV2Upgrade = (state=false, action)=>{
     if (isFetchCurrentUserAction(action, {
        except: [FETCH_CURRENT_USER_UPDATES_API_SUCCESS]
      })){
        return false
      }

      if (isClearSessionAction(action)){
        return false
      }

     switch(action.type){

       case FINISH_V2_UPGRADE_SUCCESS:
         return true

       case FINISH_V2_UPGRADE:
       case FINISH_V2_UPGRADE_FAILED:
         return false

       default:
         return state

     }
   },

   didFinishV2OrgUserUpgrade = (state=false, action)=>{
      if (isFetchCurrentUserAction(action, {
        except: [FETCH_CURRENT_USER_UPDATES_API_SUCCESS]
      })){
        return false
      }

      if (isClearSessionAction(action)){
        return false
      }

     switch(action.type){

       case FINISH_V2_ORG_USER_UPGRADE_SUCCESS:
         return true

       case FINISH_V2_ORG_USER_UPGRADE:
       case FINISH_V2_ORG_USER_UPGRADE_FAILED:
         return false

       default:
         return state

     }
   },

   upgradeV2Error = (state=null, action)=>{
      if (isClearSessionAction(action)){
        return null
      }

     switch(action.type){

       case START_V2_UPGRADE_FAILED:
       case START_V2_ORG_USER_UPGRADE_FAILED:
         return action.payload

       case START_V2_UPGRADE:
       case START_V2_ORG_USER_UPGRADE:
       case CANCEL_V2_UPGRADE:
         return null

       default:
         return state

     }
   },

   isAcceptingV2UpgradeInvite = (state=false, action)=>{
      if (isClearSessionAction(action)){
        return false
      }

     switch(action.type){

       case V2_UPGRADE_ACCEPT_INVITE:
         return true

       case V2_UPGRADE_ACCEPT_INVITE_SUCCESS:
       case V2_UPGRADE_ACCEPT_INVITE_FAILED:
         return false

       default:
         return state
     }
   },

   didAcceptV2UpgradeInvite = (state=false, action)=>{
      if (isFetchCurrentUserAction(action, {
        except: [FETCH_CURRENT_USER_UPDATES_API_SUCCESS]
      })){
        return false
      }

      if (isClearSessionAction(action)){
        return false
      }

     switch(action.type){
       case V2_UPGRADE_ACCEPT_INVITE_SUCCESS:
         return true

       case V2_UPGRADE_ACCEPT_INVITE:
         return false

       default:
         return state
     }
   },

   acceptV2UpgradeInviteError = (state=null, action)=>{
      if (isClearSessionAction(action)){
        return null
      }

     switch(action.type){
       case V2_UPGRADE_ACCEPT_INVITE_FAILED:
         return action.payload

       case V2_UPGRADE_ACCEPT_INVITE:
         return null

       default:
         return state
     }
   },

   v2UpgradeData = (state=null, action)=> {
     switch(action.type){
       case START_V2_UPGRADE_REQUEST_SUCCESS:
         return camelizeKeys(action.payload)

       case CANCEL_V2_UPGRADE:
       case FINISH_V2_UPGRADE_SUCCESS:
         return null

       default:
         return state

     }
   },

   v2UpgradeEnvkeys = (state=null, action)=>{
     switch(action.type){
       case V2_UPGRADE_GENERATE_ENVKEYS_SUCCESS:
         return action.payload

       case START_V2_UPGRADE:
       case CANCEL_V2_UPGRADE:
       case FINISH_V2_UPGRADE_SUCCESS:
         return null

       default:
         return state

     }
   },

   v2UpgradeArchive = (state=null, action)=> {
     switch(action.type){
       case EXPORT_ORG_SUCCESS:
         return action.payload.isV2Upgrade ? action.payload : state

       case FINISH_V2_UPGRADE_SUCCESS:
       case CANCEL_V2_UPGRADE:
         return null

       default:
         return state
     }
   },

   v2CoreProcAlive = (state=false, action)=> {
     switch(action.type){

       case CHECK_V2_CORE_PROC_ALIVE_SUCCESS:
         return true

       case CHECK_V2_CORE_PROC_ALIVE_FAILED:
       case FINISH_V2_UPGRADE_SUCCESS:
       case CANCEL_V2_UPGRADE:
       case FINISH_V2_ORG_USER_UPGRADE_SUCCESS:
         return false

       default:
         return state
     }
   },

   v2CoreProcIsLoadingUpgrade = (state=false, action)=> {
     switch(action.type){

       case V2_CORE_PROC_LOAD_UPGRADE:
         return true

       case V2_CORE_PROC_LOAD_UPGRADE_SUCCESS:
       case V2_CORE_PROC_LOAD_UPGRADE_FAILED:
         return false

       default:
         return state
     }
   },

   v2CoreProcLoadedUpgrade = (state=false, action)=> {
     switch(action.type){
       case V2_CORE_PROC_LOAD_UPGRADE:
         return false

       case V2_CORE_PROC_LOAD_UPGRADE_SUCCESS:
       case FINISH_V2_UPGRADE_SUCCESS:
       case CANCEL_V2_UPGRADE:
         return true

       default:
         return state
     }
   },

   v2CoreProcUpgradeStatus = (state=null, action)=> {
     switch(action.type){
       case V2_CORE_PROC_LOAD_UPGRADE:
       case FINISH_V2_UPGRADE_SUCCESS:
       case CANCEL_V2_UPGRADE:
         return null

       case CHECK_V2_UPGRADE_STATUS_SUCCESS:
         return action.payload.upgradeStatus || null

       default:
         return state
     }
   },

   v2CoreProcInviteTokensById = (state=null, action)=> {
     switch(action.type){
       case V2_CORE_PROC_LOAD_UPGRADE:
       case FINISH_V2_UPGRADE_SUCCESS:
       case CANCEL_V2_UPGRADE:
         return null

       case CHECK_V2_UPGRADE_STATUS_SUCCESS:
         return action.payload.upgradeStatus == "finished" ? action.payload.inviteTokensById || null : null

       default:
         return state
     }
   },

   upgradeToken = (state = null, action)=>{
    if (isFetchCurrentUserAction(action, {
      except: [FETCH_CURRENT_USER_UPDATES_API_SUCCESS]
    })){
      return action.payload.upgradeToken
    }

    if (isClearSessionAction(action)){
      return null
    }

    return state
  },

  encryptedV2InviteToken = (state = null, action)=>{
    if (isFetchCurrentUserAction(action, {
      except: [FETCH_CURRENT_USER_UPDATES_API_SUCCESS]
    })){
      return action.payload.encryptedV2InviteToken
    }

    if (isClearSessionAction(action)){
      return null
    }

    return state
  },

  didUpgradeV2At = (state = null, action)=>{
    if (isFetchCurrentUserAction(action, {
      except: [FETCH_CURRENT_USER_UPDATES_API_SUCCESS]
    })){
      return action.payload.didUpgradeV2At
    }

    if (isClearSessionAction(action)){
      return null
    }

    return state
  }

