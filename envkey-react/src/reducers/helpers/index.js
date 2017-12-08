import R from 'ramda'

import {
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS,
  REGISTER_SUCCESS,
  LOAD_INVITE_API_SUCCESS,
  ACCEPT_INVITE_SUCCESS,
  CREATE_ORG_SUCCESS,

  LOAD_INVITE_REQUEST,
  LOGIN,
  LOGIN_REQUEST,
  LOGOUT,
  TOKEN_INVALID,
  SELECT_ACCOUNT,
  SELECT_ORG,
  REGISTER,
  RESET_SESSION
} from "actions"

const
  fetchCurrentUserActionTypes = [
    FETCH_CURRENT_USER_SUCCESS,
    FETCH_CURRENT_USER_UPDATES_API_SUCCESS,
    REGISTER_SUCCESS,
    LOAD_INVITE_API_SUCCESS,
    ACCEPT_INVITE_SUCCESS,
    CREATE_ORG_SUCCESS
  ],

  resetSessionActionTypes = [
    LOAD_INVITE_REQUEST,
    LOGIN,
    LOGIN_REQUEST,
    LOGOUT,
    TOKEN_INVALID,
    SELECT_ORG,
    REGISTER,
    SELECT_ACCOUNT,
    RESET_SESSION
  ],

  isActionType = (base, action, opts={})=> {
    const types = R.difference(base, opts.except || []).concat(opts.add || [])
    return types.includes(action.type)
  }

export const

  indexById = objects => R.indexBy(R.prop("id"), objects),

  isFetchCurrentUserAction = (action, opts) => isActionType(fetchCurrentUserActionTypes, action, opts),

  isClearSessionAction = (action, opts) => isActionType(resetSessionActionTypes, action, opts)