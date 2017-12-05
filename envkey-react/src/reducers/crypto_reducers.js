import R from 'ramda'
import {isFetchCurrentUserAction, isClearSessionAction} from './helpers'

import {
  LOGIN,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,

  REGISTER,
  REGISTER_SUCCESS,

  LOGOUT,
  LOGOUT_ALL,

  SELECT_ACCOUNT,
  SELECT_ORG,

  FETCH_CURRENT_USER_REQUEST,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS,

  DECRYPT_PRIVKEY,

  DECRYPT_PRIVKEY_FAILED,
  DECRYPT_PRIVKEY_SUCCESS,

  DECRYPT_ENVS,
  DECRYPT_ENVS_FAILED,
  DECRYPT_ENVS_SUCCESS,

  VERIFY_CURRENT_USER_PUBKEY,
  DECRYPT_ALL,
  DECRYPT_ALL_FAILED,
  DECRYPT_ALL_SUCCESS,

  GENERATE_USER_KEYPAIR,
  GENERATE_USER_KEYPAIR_SUCCESS,

  GENERATE_ASSOC_KEY_SUCCESS,
  CLEAR_GENERATED_ASSOC_KEY,

  VERIFY_TRUSTED_PUBKEYS_SUCCESS,
  VERIFY_TRUSTED_PUBKEYS_FAILED,

  ADD_TRUSTED_PUBKEY,

  LOAD_INVITE_REQUEST,
  LOAD_INVITE_API_SUCCESS,
  ACCEPT_INVITE_REQUEST,
  ACCEPT_INVITE_SUCCESS,

  UPDATE_ENCRYPTED_PRIVKEY,
  UPDATE_ENCRYPTED_PRIVKEY_SUCCESS,
  UPDATE_ENCRYPTED_PRIVKEY_FAILED
} from 'actions'

export const

  isDecryptingAll = (state = false, action)=>{
    if (isClearSessionAction(action)){
      return false
    }

    switch(action.type){
      case DECRYPT_ALL:
      case VERIFY_CURRENT_USER_PUBKEY:
        return !R.path(["meta", "background"], action)

      case DECRYPT_ALL_SUCCESS:
      case DECRYPT_ALL_FAILED:
        return false

      default:
        return state
    }
  },

  decryptedAll = (state = false, action)=>{
    if (isClearSessionAction(action)){
      return false
    }

    switch(action.type){
      case DECRYPT_ALL:
        return R.path(["meta", "background"], action) ? state : false

      case ACCEPT_INVITE_REQUEST:
        return false

      case DECRYPT_ALL_SUCCESS:
        return true

      default:
        return state
    }
  },

  envsAreDecrypting = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case DECRYPT_ENVS:
        return R.path(["meta", "background"], action) ? state : R.assoc(action.meta.targetId, true, state)

      case DECRYPT_ENVS_SUCCESS:
      case DECRYPT_ENVS_FAILED:
        return R.path(["meta", "background"], action) ? state :  R.dissoc(action.meta.targetId, state)

      case ACCEPT_INVITE_REQUEST:
        return {}

      default:
        return state
    }
  },

  envsAreDecrypted = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case DECRYPT_ENVS:
        return R.path(["meta", "background"], action) ? state : R.dissoc(action.meta.targetId, state)

      case DECRYPT_ENVS_SUCCESS:
        return R.assoc(action.meta.targetId, true, state)

      case ACCEPT_INVITE_REQUEST:
      case FETCH_CURRENT_USER_REQUEST:
        return {}

      case DECRYPT_ALL:
        return R.path(["meta", "background"], action) ? state : {}

      default:
        return state
    }
  },

  encryptedPrivkey = (state = null, action)=>{
    if (isClearSessionAction(action)){
      return null
    }

    if (isFetchCurrentUserAction(action, {except: [FETCH_CURRENT_USER_UPDATES_API_SUCCESS]})){
      return action.payload.encryptedPrivkey
    }

    switch(action.type){
      case UPDATE_ENCRYPTED_PRIVKEY_SUCCESS:
        return action.meta.requestPayload.encryptedPrivkey
      default:
        return state
    }
  },

  privkey = (state = null, action)=>{
    if (isClearSessionAction(action, {except: [SELECT_ORG, SELECT_ACCOUNT]})){
      return null
    }

    switch(action.type){
      case SELECT_ACCOUNT:
        return action.payload.privkey || null
      case DECRYPT_PRIVKEY_SUCCESS:
        return action.payload
      case DECRYPT_ENVS_FAILED:
      case DECRYPT_ALL_FAILED:
      case ACCEPT_INVITE_REQUEST:
        return null
      default:
        return state
    }
  },

  accountPrivkeys = (state = {}, action)=> {
    switch (action.type){
      case DECRYPT_PRIVKEY_SUCCESS:
        return R.assoc(action.meta.currentUserId, action.payload, state)

      case LOGOUT_ALL:
        return {}

      case LOGOUT:
        return R.dissoc(action.meta.currentUserId, state)

      default:
        return state
    }
  },

  isDecryptingPrivkey = (state = false, action)=>{
    if (isClearSessionAction(action)){
      return false
    }

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

  isUpdatingEncryptedPrivkey = (state = false, action)=>{
    if (isClearSessionAction(action)){
      return false
    }

    switch(action.type){
      case UPDATE_ENCRYPTED_PRIVKEY:
        return true
      case UPDATE_ENCRYPTED_PRIVKEY_SUCCESS:
      case UPDATE_ENCRYPTED_PRIVKEY_FAILED:
        return false
      default:
        return state
    }
  },

  updateEncryptedPrivkeyErr = (state = null, action)=>{
    if (isClearSessionAction(action)){
      return null
    }

    switch(action.type){
      case UPDATE_ENCRYPTED_PRIVKEY_FAILED:
        return action.payload

      case UPDATE_ENCRYPTED_PRIVKEY:
        return null

      default:
        return state
    }
  },

  decryptPrivkeyErr = (state = null, action)=>{
    switch(action.type){
      case DECRYPT_PRIVKEY:
        return null

      case DECRYPT_PRIVKEY_FAILED:
        return action.payload

      default:
        return state
    }
  },

  decryptAllErr = (state = null, action)=>{
    switch(action.type){
      case DECRYPT_ALL:
        return null

      case DECRYPT_ALL_FAILED:
        return action.payload

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
  },

  signedTrustedPubkeys = ( state = null, action)=>{
    if (isClearSessionAction(action)){
      return null
    }

    if (isFetchCurrentUserAction(action)){
      return action.payload.signedTrustedPubkeys || null
    }

    switch(action.type){
      case ACCEPT_INVITE_REQUEST:
      case VERIFY_TRUSTED_PUBKEYS_FAILED:
      case VERIFY_TRUSTED_PUBKEYS_SUCCESS:
        return null

      default:
        return state
    }
  },

  trustedPubkeys = ( state = {}, action)=>{
    if (isClearSessionAction(action)){
      return null
    }

    switch(action.type){
      case VERIFY_TRUSTED_PUBKEYS_SUCCESS:
        return action.payload

      case ADD_TRUSTED_PUBKEY:
        return R.assoc(action.meta.keyableId, action.payload, state)

      case ACCEPT_INVITE_REQUEST:
      case VERIFY_TRUSTED_PUBKEYS_FAILED:
        return {}

      default:
        return state
    }
  },

  generatedEnvKeys = ( state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case GENERATE_ASSOC_KEY_SUCCESS:
        return R.assoc(action.meta.targetId, {envkey: action.payload.envkey, passphrase: action.meta.passphrase}, state)

      case CLEAR_GENERATED_ASSOC_KEY:
        return R.dissoc(action.payload, state)

      default:
        return state
    }
  }

