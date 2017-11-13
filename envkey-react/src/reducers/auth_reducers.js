import {isFetchCurrentUserAction, isClearSessionAction} from './helpers'

import {
  APP_LOADED,

  DISCONNECTED,

  VERIFY_EMAIL_REQUEST,
  VERIFY_EMAIL_SUCCESS,
  VERIFY_EMAIL_FAILED,

  VERIFY_EMAIL_CODE_REQUEST,
  VERIFY_EMAIL_CODE_SUCCESS,
  VERIFY_EMAIL_CODE_FAILED,

  LOAD_INVITE_REQUEST,
  LOAD_INVITE_API_SUCCESS,
  LOAD_INVITE_SUCCESS,

  RESET_VERIFY_EMAIL,
  RESET_ACCEPT_INVITE,

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

  CREATE_ORG_SUCCESS,

  FETCH_CURRENT_USER_UPDATES_SUCCESS,

  TOKEN_INVALID,

  ACCEPT_INVITE,
  ACCEPT_INVITE_REQUEST,
  ACCEPT_INVITE_SUCCESS,
  ACCEPT_INVITE_FAILED,

  SELECT_ORG,

  START_DEMO
} from 'actions'
import R from 'ramda'
import {decamelizeKeys} from 'xcase'

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

  verifyingEmail = (state = null, action)=>{
    switch(action.type){
      case VERIFY_EMAIL_SUCCESS:
        return action.meta.requestPayload.email

      case LOGIN_SUCCESS:
      case REGISTER_SUCCESS:
      case ACCEPT_INVITE_SUCCESS:
      case RESET_VERIFY_EMAIL:
      case RESET_ACCEPT_INVITE:
        return null

      default:
        return state
    }
  },

  emailVerificationType = (state = null, action)=>{
    switch(action.type){
      case VERIFY_EMAIL_SUCCESS:
        return action.payload.verificationType

      case LOGIN_SUCCESS:
      case REGISTER_SUCCESS:
      case ACCEPT_INVITE_SUCCESS:
      case RESET_VERIFY_EMAIL:
        return null

      default:
        return state
    }
  },

  emailVerificationCode = (state = null, action)=>{
    switch(action.type){
      case VERIFY_EMAIL_CODE_SUCCESS:
      case LOAD_INVITE_SUCCESS:
        return action.meta.requestPayload.emailVerificationCode

      case LOGIN_SUCCESS:
      case REGISTER_SUCCESS:
      case ACCEPT_INVITE_SUCCESS:
      case RESET_VERIFY_EMAIL:
        return null

      default:
        return state
    }
  },

  isVerifyingEmail = (state = false, action)=>{
    switch(action.type){
      case VERIFY_EMAIL_REQUEST:
        return true

      case VERIFY_EMAIL_SUCCESS:
      case VERIFY_EMAIL_FAILED:
        return false

      default:
        return state
    }
  },

  isVerifyingEmailCode = (state = false, action)=>{
    switch(action.type){
      case VERIFY_EMAIL_CODE_REQUEST:
        return true

      case VERIFY_EMAIL_CODE_SUCCESS:
      case VERIFY_EMAIL_CODE_FAILED:
        return false

      default:
        return state
    }
  },

  verifyEmailError = (state = null, action)=>{
    switch(action.type){
      case VERIFY_EMAIL_FAILED:
        return action.payload

      case VERIFY_EMAIL_REQUEST:
      case RESET_VERIFY_EMAIL:
        return null

      default:
        return state
    }
  },

  verifyEmailCodeError = (state = null, action)=>{
    switch(action.type){
      case VERIFY_EMAIL_CODE_FAILED:
        return action.payload

      case VERIFY_EMAIL_CODE_REQUEST:
      case RESET_VERIFY_EMAIL:
        return null

      default:
        return state
    }
  },

  auth = (state = null, action)=> {
    if (isFetchCurrentUserAction(action)){
      return {
        ...R.pick(["slug", "id"], action.payload),
        ...R.pick(["access-token", "uid", "client"], action.meta.headers)
      }
    }

    if (isClearSessionAction(action)){
      return null
    }

    return state
  },

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
      case ACCEPT_INVITE_SUCCESS:
      case ACCEPT_INVITE_FAILED:
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
      case ACCEPT_INVITE_SUCCESS:
      case ACCEPT_INVITE_FAILED:
        return false

      default:
        return state
    }
  },

  authError = (state = null, action)=>{
    switch(action.type){
      case LOGIN_FAILED:
      case REGISTER_FAILED:
        return action.payload

      case LOAD_INVITE_REQUEST:
      case LOGIN:
      case LOGIN_REQUEST:
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

      case LOAD_INVITE_REQUEST:
      case FETCH_CURRENT_USER_REQUEST:
      case LOGIN:
      case LOGIN_REQUEST:
      case LOGOUT:
        return null
      default:
        return state
    }
  },

  permissions = (state = {}, action)=>{
    if (isFetchCurrentUserAction(action)){
      return action.payload.permissions
    }

    if (isClearSessionAction(action)){
      return {}
    }

    return state
  },

  orgRolesInvitable = (state = [], action)=>{
    if (isFetchCurrentUserAction(action)){
      return action.payload.orgRolesInvitable
    }

    if (isClearSessionAction(action)){
      return []
    }

    return state
  },

  appEnvironmentsAccessible = (state = {}, action)=>{
    if (isFetchCurrentUserAction(action)){
      return R.mapObjIndexed(decamelizeKeys)(action.payload.appEnvironmentsAccessible)
    }

    if (isClearSessionAction(action)){
      return {}
    }

    return state
  },

  appEnvironmentsAssignable = (state = {}, action)=>{
    if (isFetchCurrentUserAction(action)){
      return R.mapObjIndexed(decamelizeKeys)(action.payload.appEnvironmentsAssignable)
    }

    if (isClearSessionAction(action)){
      return {}
    }

    return state
  },

  hasSingleApp = (state = false, action)=>{
    if (isFetchCurrentUserAction(action)){
      return action.payload.apps.length <= 1
    }

    if (isClearSessionAction(action)){
      return false
    }

    return state
  },

  lastFetchAt = (state = null, action)=>{
    if (isFetchCurrentUserAction(action)){
      return action.payload.lastFetchAt
    }

    if (isClearSessionAction(action)){
      return null
    }

    return state
  },

  isDemo = (state = false, {type})=> type == START_DEMO ? true : state







