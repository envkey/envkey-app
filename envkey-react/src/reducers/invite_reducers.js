import R from 'ramda'

import {
  GENERATE_INVITE_LINK,
  GENERATE_INVITE_LINK_SUCCESS,
  GENERATE_INVITE_LINK_FAILED,
  CLOSE_GENERATED_INVITE_LINK,

  VERIFY_INVITE_PARAMS,
  VERIFY_INVITE_PARAMS_SUCCESS,
  VERIFY_INVITE_PARAMS_FAILED,

  ACCEPT_INVITE,
  ACCEPT_INVITE_REQUEST,
  ACCEPT_INVITE_SUCCESS,
  ACCEPT_INVITE_FAILED,

  LOGIN,
  LOGIN_REQUEST,
  LOGOUT,
  REGISTER,
  SELECT_ORG,
  FETCH_CURRENT_USER_SUCCESS,

  INVITE_USER,
  INVITE_USER_SUCCESS,
  INVITE_USER_FAILED
} from "actions"

export const

  isInvitee = (state = false, action)=>{
    switch (action.type){
      case ACCEPT_INVITE_SUCCESS:
        return true

      case LOGIN:
      case LOGIN_REQUEST:
      case LOGOUT:
      case REGISTER:
        return false

      default:
        return state
    }
  },

  invitedBy = (state = null, action)=>{
    switch(action.type){
      case FETCH_CURRENT_USER_SUCCESS:
        return action.payload.invitedBy

      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case SELECT_ORG:
        return null

      default:
        return state
    }
  },

  inviteParamsVerified = (state=false, action)=>{
    switch(action.type){
      case VERIFY_INVITE_PARAMS_SUCCESS:
        return true

      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
        return false

      default:
        return state
    }
  },

  inviteParamsInvalid = (state=false, action)=>{
    switch(action.type){
      case VERIFY_INVITE_PARAMS_FAILED:
        return true

      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
        return false

      default:
        return state
    }
  },

  acceptInviteError = (state=null, action)=>{
    switch(action.type){
      case ACCEPT_INVITE_FAILED:
        return {status: action.meta.status, error: action.payload}

      case ACCEPT_INVITE:
      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
        return null

      default:
        return state
    }
  },

  isGeneratingInviteLink = (state={}, action)=>{
    switch(action.type){

      case GENERATE_INVITE_LINK:
        return R.assoc(action.meta.parentId, true, state)

      case GENERATE_INVITE_LINK_SUCCESS:
      case GENERATE_INVITE_LINK_FAILED:
        return R.dissoc(action.meta.parentId, state)

      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case SELECT_ORG:
        return {}

      default:
        return state
    }
  },

  generatedInviteLinks = (state={}, action)=>{
    switch(action.type){
      case GENERATE_INVITE_LINK_SUCCESS:
        return R.assoc(action.meta.parentId, R.pick(["identityHash", "passphrase", "user"], action.meta), state)

      case GENERATE_INVITE_LINK:
      case CLOSE_GENERATED_INVITE_LINK:
        return R.dissoc(action.meta.parentId, state)

      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case SELECT_ORG:
        return {}

      default:
        return state
    }
  },

  invitingUser = (state={}, action)=>{
    switch(action.type){
      case INVITE_USER:
        return R.assoc(action.meta.parentId, action.payload.user, state)

      case INVITE_USER_FAILED:
        return R.dissoc(action.meta.parentId, state)

      case INVITE_USER_SUCCESS:
        return R.dissoc(action.meta.parentId, state)

      default:
        return state
    }
  },

  inviteParams = (state=null, action)=>{
    switch(action.type){
      case LOAD_INVITE_SUCCESS:
        return action.payload

      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
        return null

      default:
        return state
    }
  },

  inviteIdentityHash = (state=null, action)=>{
    switch(action.type){
      case LOAD_INVITE:
        return action.payload.identityHash

      case ACCEPT_INVITE_SUCCESS:
      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
        return null

      default:
        return state
    }
  },

  invitePassphrase = (state=null, action)=>{
    switch(action.type){
      case LOAD_INVITE:
        return action.payload.passphrase

      case ACCEPT_INVITE_SUCCESS:
      case LOGOUT:
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
        return null

      default:
        return state
    }
  },

  inviteePubkey = (state=null, action)=>{
    switch (action.type){
      case VERIFY_INVITE_EMAIL_API_SUCCESS:
        return action.payload.pubkey

      case ACCEPT_INVITE_SUCCESS:
      case VERIFY_INVITE_EMAIL_REQUEST:
        return null

      default:
        return state
    }
  },

  inviteeEncryptedPrivkey = (state=null, action)=>{
    switch (action.type){
      case VERIFY_INVITE_EMAIL_API_SUCCESS:
        return action.payload.inviteeEncryptedPrivkey

      case ACCEPT_INVITE_SUCCESS:
      case VERIFY_INVITE_EMAIL_REQUEST:
        return null

      default:
        return state
    }
  }