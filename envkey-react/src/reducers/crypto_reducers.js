import R from 'ramda'

import {
  LOGIN,
  LOGIN_SUCCESS,

  REGISTER,
  REGISTER_SUCCESS,

  LOGOUT,

  FETCH_CURRENT_USER_SUCCESS,

  TOKEN_INVALID,

  DECRYPT_PRIVKEY,
  DECRYPT_PRIVKEY_FAILED,
  DECRYPT_PRIVKEY_SUCCESS,

  DECRYPT_ENVS,
  DECRYPT_ENVS_FAILED,
  DECRYPT_ENVS_SUCCESS,

  DECRYPT_ALL,
  DECRYPT_ALL_SUCCESS,

  GENERATE_USER_KEYPAIR,
  GENERATE_USER_KEYPAIR_SUCCESS,
} from 'actions'

export const

  isDecryptingAll = (state = false, action)=>{
    switch(action.type){
      case DECRYPT_ALL:
        return true

      case DECRYPT_ALL_SUCCESS:
      case DECRYPT_ENVS_FAILED:
        return false

      default:
        return state
    }
  },

  decryptedAll = (state = false, action)=>{
    switch(action.type){
      case DECRYPT_ALL:
        return false

      case DECRYPT_ALL_SUCCESS:
        return true

      default:
        return state
    }
  },

  envsAreDecrypting = (state = {}, action)=>{
    switch(action.type){
      case DECRYPT_ENVS:
        return R.assoc(action.meta.targetId, true, state)

      case DECRYPT_ENVS_SUCCESS:
      case DECRYPT_ENVS_FAILED:
        return R.dissoc(action.meta.targetId, state)

      default:
        return state
    }
  },

  envsAreDecrypted = (state = {}, action)=>{
    switch(action.type){
      case DECRYPT_ENVS_SUCCESS:
        return R.assoc(action.meta.targetId, true, state)

      default:
        return state
    }
  },

  encryptedPrivkey = (state = null, action)=>{
    switch(action.type){
      case LOGIN_SUCCESS:
      case FETCH_CURRENT_USER_SUCCESS:
      case REGISTER_SUCCESS:
        return action.payload.encryptedPrivkey
      case LOGIN:
      case LOGOUT:
      case REGISTER:
      case TOKEN_INVALID:
      case DECRYPT_PRIVKEY_SUCCESS:
        return null
      default:
        return state
    }
  },

  privkey = (state = null, action)=>{
    switch(action.type){
      case DECRYPT_PRIVKEY_SUCCESS:
        return action.payload
      case LOGIN:
      case LOGOUT:
      case REGISTER:
      case TOKEN_INVALID:
      case DECRYPT_ENVS_FAILED:
        return null
      default:
        return state
    }
  },

  isDecryptingPrivkey = (state = false, action)=>{
    switch(action.type){
      case DECRYPT_PRIVKEY:
        return true
      case DECRYPT_PRIVKEY_SUCCESS:
      case DECRYPT_PRIVKEY_FAILED:
        return false
      default:
        return state
    }
  },

  isGeneratingUserKey = (state = false, action)=>{
    switch(action.type){
      case GENERATE_USER_KEYPAIR:
        return true
      case GENERATE_USER_KEYPAIR_SUCCESS:
        return false
      default:
        return state
    }
  }
