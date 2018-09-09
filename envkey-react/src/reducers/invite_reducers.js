import {isClearSessionAction} from './helpers'
import R from 'ramda'

import {
  GENERATE_INVITE_LINK,
  GENERATE_INVITE_LINK_SUCCESS,
  GENERATE_INVITE_LINK_FAILED,
  CLOSE_GENERATED_INVITE_LINK,

  LOAD_INVITE_REQUEST,
  LOAD_INVITE_API_SUCCESS,
  LOAD_INVITE_SUCCESS,
  LOAD_INVITE_FAILED,

  REFRESH_INVITE_REQUEST,
  REFRESH_INVITE_API_SUCCESS,
  REFRESH_INVITE_SUCCESS,
  REFRESH_INVITE_FAILED,

  VERIFY_INVITE_PARAMS,
  VERIFY_INVITE_PARAMS_SUCCESS,
  VERIFY_INVITE_PARAMS_FAILED,

  ACCEPT_INVITE,
  ACCEPT_INVITE_REQUEST,
  ACCEPT_INVITE_SUCCESS,
  ACCEPT_INVITE_FAILED,

  RESET_ACCEPT_INVITE,

  FETCH_CURRENT_USER_SUCCESS,

  INVITE_USER,
  INVITE_USER_SUCCESS,
  INVITE_USER_FAILED,

  REVOKE_INVITE,
  REVOKE_INVITE_SUCCESS,
  REVOKE_INVITE_FAILED,

  REGEN_INVITE,
  REGEN_INVITE_SUCCESS,
  REGEN_INVITE_FAILED,

  INVITE_EXISTING_USER_INVALID_PASSPHRASE
} from "actions"

export const

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
  },

  invitedBy = (state = null, action)=>{
    if (isClearSessionAction(action)){
      return null
    }

    switch(action.type){
      case FETCH_CURRENT_USER_SUCCESS:
      case LOAD_INVITE_API_SUCCESS:
      case ACCEPT_INVITE_SUCCESS:
        return action.payload.invitedBy

      default:
        return state
    }
  },

  inviteParamsVerified = (state=false, action)=>{
    if (isClearSessionAction(action) ||
        action.type == RESET_ACCEPT_INVITE){
      return null
    }

    switch(action.type){
      case VERIFY_INVITE_PARAMS_SUCCESS:
        return true

      default:
        return state
    }
  },

  inviteParamsInvalid = (state=false, action)=>{
    if (isClearSessionAction(action) ||
        action.type == RESET_ACCEPT_INVITE){
      return false
    }

    switch(action.type){
      case VERIFY_INVITE_PARAMS_FAILED:
        return true

      default:
        return state
    }
  },

  acceptInviteError = (state=null, action)=>{
    if (isClearSessionAction(action) ||
        action.type == ACCEPT_INVITE){
      return null
    }

    switch(action.type){
      case ACCEPT_INVITE_FAILED:
        return {status: action.meta.status, error: action.payload}

      default:
        return state
    }
  },

  isGeneratingInviteLink = (state={}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){

      case GENERATE_INVITE_LINK:
        return R.assoc(action.meta.parentId, true, state)

      case GENERATE_INVITE_LINK_SUCCESS:
      case GENERATE_INVITE_LINK_FAILED:
        return R.dissoc(action.meta.parentId, state)

      default:
        return state
    }
  },

  generatedInviteLinks = (state={}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case GENERATE_INVITE_LINK_SUCCESS:
        return R.assoc(action.meta.parentId, R.pick(["identityHash", "passphrase", "user"], action.meta), state)

      case GENERATE_INVITE_LINK:
      case CLOSE_GENERATED_INVITE_LINK:
      case INVITE_USER_FAILED:
        return R.dissoc(action.meta.parentId, state)

      default:
        return state
    }
  },

  invitingUser = (state={}, action)=>{
    switch(action.type){
      case INVITE_USER:
        if (action.meta.isReinvite){
          return state
        } else {
          return R.assoc(action.meta.parentId, action.payload.user, state)
        }

      case INVITE_USER_FAILED:
        return R.dissoc(action.meta.parentId, state)

      case INVITE_USER_SUCCESS:
        return R.dissoc(action.meta.parentId, state)

      default:
        return state
    }
  },

  isLoadingInvite = (state=false, action)=>{
    switch(action.type){
      case LOAD_INVITE_REQUEST:
        return true

      case LOAD_INVITE_FAILED:
      case LOAD_INVITE_SUCCESS:
        return false

      default:
        return state
    }
  },

  loadInviteError = (state=null, action)=>{
    if (isClearSessionAction(action) ||
        action.type == RESET_ACCEPT_INVITE){
      return null
    }

    switch(action.type){
      case REFRESH_INVITE_REQUEST:
        return null

      case LOAD_INVITE_FAILED:
      case REFRESH_INVITE_FAILED:
        return action.payload

      default:
        return state
    }
  },

  inviteParams = (state=null, action)=>{
    if (isClearSessionAction(action) ||
        action.type == RESET_ACCEPT_INVITE){
      return null
    }

    switch(action.type){
      case LOAD_INVITE_API_SUCCESS:
      case REFRESH_INVITE_API_SUCCESS:
        return action.payload

      default:
        return state
    }
  },

  inviteIdentityHash = (state=null, action)=>{
    if (isClearSessionAction(action, {except: [LOAD_INVITE_REQUEST]}) ||
        action.type == RESET_ACCEPT_INVITE){
      return null
    }

    switch(action.type){
      case LOAD_INVITE_REQUEST:
        return action.meta.identityHash

      default:
        return state
    }
  },

  invitePassphrase = (state=null, action)=>{
    if (isClearSessionAction(action, {except: [LOAD_INVITE_REQUEST]})){
      return null
    }

    switch(action.type){
      case LOAD_INVITE_REQUEST:
        return action.meta.passphrase

      case RESET_ACCEPT_INVITE:
      case ACCEPT_INVITE_SUCCESS:
        return null

      default:
        return state
    }
  },

  inviteePubkey = (state=null, action)=>{
    switch (action.type){
      case LOAD_INVITE_API_SUCCESS:
        return action.payload.pubkey

      case RESET_ACCEPT_INVITE:
      case ACCEPT_INVITE_SUCCESS:
        return null

      default:
        return state
    }
  },

  inviteeEncryptedPrivkey = (state=null, action)=>{
    switch (action.type){
      case LOAD_INVITE_API_SUCCESS:
        return action.payload.inviteeEncryptedPrivkey

      case RESET_ACCEPT_INVITE:
      case ACCEPT_INVITE_SUCCESS:
        return null

      default:
        return state
    }
  },

  isRevokingInvite = (state={}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case REVOKE_INVITE:
        return {...state, [action.payload.userId]: true}

      case REVOKE_INVITE_SUCCESS:
      case REVOKE_INVITE_FAILED:
        return R.dissoc(action.meta.userId, state)

      default:
        return state
    }
  },

  isRegeneratingInvite = (state={}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case REGEN_INVITE:
        return {...state, [action.payload.userId]: true}

      case REGEN_INVITE_SUCCESS:
      case REGEN_INVITE_FAILED:
        return R.dissoc(action.meta.userId, state)

      default:
        return state
    }
  },

  inviteExistingUserInvalidPassphraseError = (state=null, action)=>{
    if (isClearSessionAction(action) ||
        action.type == RESET_ACCEPT_INVITE){
      return null
    }

    switch(action.type){
      case INVITE_EXISTING_USER_INVALID_PASSPHRASE:
        return action.payload

      case ACCEPT_INVITE_SUCCESS:
        return null

      default:
        return state
    }
  }