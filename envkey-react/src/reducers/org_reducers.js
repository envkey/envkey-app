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
  ACCEPT_INVITE_SUCCESS
} from "actions"
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

    case LOGIN:
    case LOGIN_REQUEST:
    case REGISTER:
    case LOGOUT:
      return {}

    default:
      return state
  }
}
