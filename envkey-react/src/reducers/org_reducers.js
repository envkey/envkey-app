import {
  SELECT_ORG,
  FETCH_CURRENT_USER_SUCCESS,
  LOGIN,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  REGISTER,
  REGISTER_SUCCESS,
  LOGOUT,
  ORG_INVALID,
  LOAD_INVITE_API_SUCCESS,
  ACCEPT_INVITE_SUCCESS,
  RENAME_OBJECT_SUCCESS,
  BILLING_UPDATE_SUBSCRIPTION_REQUEST,
  BILLING_UPDATE_SUBSCRIPTION_SUCCESS,
  BILLING_UPDATE_SUBSCRIPTION_FAILED,
  BILLING_UPDATE_CARD_REQUEST,
  BILLING_UPDATE_CARD_SUCCESS,
  BILLING_UPDATE_CARD_FAILED,
  FETCH_CURRENT_USER_UPDATES_SUCCESS
} from "actions"
import R from 'ramda'
import {indexById} from './helpers'

export const currentOrgSlug = (state = null, action)=>{
  switch(action.type){
    case SELECT_ORG:
      return action.payload

    case LOAD_INVITE_API_SUCCESS:
      return action.payload.org.slug

    case REGISTER_SUCCESS:
      return action.payload.orgs[0].slug

    case ACCEPT_INVITE_SUCCESS:
      return action.meta.orgSlug

    case LOGIN:
    case LOGIN_REQUEST:
    case REGISTER:
    case LOGOUT:
    case ORG_INVALID:
      return null

    default:
      return state
  }
}

export const orgs = (state = {}, action)=>{
  switch(action.type){
    case FETCH_CURRENT_USER_SUCCESS:
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
    case ACCEPT_INVITE_SUCCESS:
      return indexById(action.payload.orgs)

    case LOAD_INVITE_API_SUCCESS:
      return indexById([action.payload.org])

    case FETCH_CURRENT_USER_UPDATES_SUCCESS:
      if (action.meta && action.meta.noMinUpdatedAt){
        return action.payload.orgs ? indexById(action.payload.orgs) : state
      } else {
        return action.payload.orgs && action.payload.orgs.length ? {...state, ...indexById(action.payload.orgs)} : state
      }

    case BILLING_UPDATE_CARD_SUCCESS:
    case BILLING_UPDATE_SUBSCRIPTION_SUCCESS:
      return R.assoc(action.payload.id, action.payload, state)

    case RENAME_OBJECT_SUCCESS:
      if (action.meta.objectType == "org"){
        return R.assoc(action.payload.id, action.payload, state)
      } else {
        return state
      }

    case LOGIN:
    case LOGIN_REQUEST:
    case REGISTER:
    case LOGOUT:
      return {}

    default:
      return state
  }
}

export const isUpdatingSubscription = (state = false, action)=>{
  switch(action.type){
    case BILLING_UPDATE_SUBSCRIPTION_REQUEST:
      return true

    case BILLING_UPDATE_SUBSCRIPTION_FAILED:
      return false

    case BILLING_UPDATE_SUBSCRIPTION_SUCCESS:
      return action.meta.updateType == "cancel" ? state : false

    default:
      return state
  }
}

export const isUpdatingStripeCard = (state = false, action)=>{
  switch(action.type){
    case BILLING_UPDATE_CARD_REQUEST:
      return true

    case BILLING_UPDATE_CARD_SUCCESS:
    case BILLING_UPDATE_CARD_FAILED:
      return false

    default:
      return state
  }
}