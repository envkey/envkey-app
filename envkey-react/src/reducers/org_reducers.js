import {SELECT_ORG,
        FETCH_CURRENT_USER_SUCCESS,
        LOGIN,
        LOGIN_SUCCESS,
        REGISTER,
        REGISTER_SUCCESS,
        LOGOUT,
        ORG_INVALID} from "actions"
import {indexById} from './helpers'

export const currentOrgSlug = (state = null, action)=>{
  switch(action.type){
    case SELECT_ORG:
      return action.payload

    case LOGIN:
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
      return indexById(action.payload.orgs)

    case LOGIN:
    case REGISTER:
    case LOGOUT:
      return {}

    default:
      return state
  }
}
