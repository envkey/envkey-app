import {
  LOGIN,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  REGISTER,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILED,
  LOGOUT,
  FETCH_CURRENT_USER_REQUEST,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_FAILED,
  TOKEN_INVALID,
  DECRYPT_PRIVKEY,
  DECRYPT_PRIVKEY_FAILED,
  DECRYPT_PRIVKEY_SUCCESS,
  DECRYPT_ENVS,
  DECRYPT_ENVS_FAILED,
  DECRYPT_ENVS_SUCCESS,
  ACCEPT_INVITE,
  ACCEPT_INVITE_REQUEST,
  GENERATE_USER_KEY,
  GENERATE_USER_KEY_SUCCESS,
  HASH_USER_PASSWORD,
  HASH_USER_PASSWORD_SUCCESS,
  GRANT_ENV_ACCESS_SUCCESS
} from 'actions'
import R from 'ramda'
import {decamelizeKeys} from 'xcase'

export const

  isAuthenticating = (state = false, action)=> {
    switch(action.type){
      case LOGIN:
      case ACCEPT_INVITE:
      case REGISTER:
        return true

      case LOGIN_SUCCESS:
      case LOGIN_FAILED:
      case REGISTER_SUCCESS:
      case REGISTER_FAILED:
        return false

      default:
        return state
    }
  },

  isAuthenticatingServer = (state = false, action)=> {
    switch(action.type){
      case LOGIN_REQUEST:
      case ACCEPT_INVITE_REQUEST:
      case REGISTER_REQUEST:
        return true

      case LOGIN_SUCCESS:
      case LOGIN_FAILED:
      case REGISTER_SUCCESS:
      case REGISTER_FAILED:
        return false

      default:
        return state
    }
  },

  isHashingPassword = (state = false, action)=> {
    switch(action.type){
      case HASH_USER_PASSWORD:
        return true

      case HASH_USER_PASSWORD_SUCCESS:
        return false

      default:
        return state
    }
  },

  authErr = (state = null, action)=>{
    switch(action.type){
      case LOGIN_FAILED:
      case REGISTER_FAILED:
        return action.payload
      case LOGIN:
      case REGISTER:
        return null
      default:
        return state
    }
  },

  isFetchingCurrentUser = (state = false, action)=> {
    switch(action.type){
      case FETCH_CURRENT_USER_REQUEST:
        return true

      case FETCH_CURRENT_USER_SUCCESS:
      case FETCH_CURRENT_USER_FAILED:
        return false

      default:
        return state
    }
  },

  currentUserErr = (state = null, action)=>{
    switch(action.type){
      case FETCH_CURRENT_USER_FAILED:
        return action.payload
      case FETCH_CURRENT_USER_REQUEST:
      case LOGIN:
        return null
      default:
        return state
    }
  },

  isDecryptingEnvs = (state = false, action)=> {
    switch(action.type){
      case DECRYPT_ENVS:
        return true

      case DECRYPT_ENVS_SUCCESS:
      case DECRYPT_ENVS_FAILED:
        return false

      default:
        return state
    }
  },

  envsAreDecrypted = (state = false, action)=> {
    switch(action.type){
      case DECRYPT_ENVS:
        return false

      case DECRYPT_ENVS_SUCCESS:
        return true

      default:
        return state
    }
  },

  auth = (state = null, action)=> {
    switch(action.type){
      case LOGIN_SUCCESS:
      case REGISTER_SUCCESS:
        return {
          ...R.pick(["slug", "id"], action.payload),
          ...R.pick(["access-token", "uid", "client"], action.meta.headers)
        }

      case LOGIN:
      case REGISTER:
      case LOGOUT:
      case TOKEN_INVALID:
        return null

      default:
        return state
    }
  },

  permissions = (state = {}, action)=>{
    switch(action.type){
      case FETCH_CURRENT_USER_SUCCESS:
      case REGISTER_SUCCESS:
        return action.payload.permissions
      case LOGIN:
      case LOGOUT:
      case TOKEN_INVALID:
        return {}
      default:
        return state
    }
  },

  appEnvironmentsAccessible = (state = {}, action)=>{
    switch(action.type){
      case FETCH_CURRENT_USER_SUCCESS:
      case REGISTER_SUCCESS:
        return R.mapObjIndexed(decamelizeKeys)(action.payload.appEnvironmentsAccessible)
      case LOGIN:
      case LOGOUT:
      case TOKEN_INVALID:
        return {}
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
      case TOKEN_INVALID:
      case DECRYPT_PRIVKEY_SUCCESS:
      case DECRYPT_ENVS_SUCCESS:
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
      case TOKEN_INVALID:
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
      case GENERATE_USER_KEY:
        return true
      case GENERATE_USER_KEY_SUCCESS:
        return false
      default:
        return state
    }
  },

  inviteesNeedingAccess = (state = [], action)=>{
    switch(action.type){
      case FETCH_CURRENT_USER_SUCCESS:
        return action.payload.inviteesNeedingAccess
      case GRANT_ENV_ACCESS_SUCCESS:
        return []
      default:
        return state
    }
  }







