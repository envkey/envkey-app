import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  APP_LOADED,
  LOGIN,
  REGISTER,
  ACCEPT_INVITE,
  FETCH_CURRENT_USER_REQUEST,
  LOGOUT,
  DECRYPT,
  GRANT_ENV_ACCESS_REQUEST
} from './action_types'

export const
  appLoaded = createAction(APP_LOADED),

  login = createAction(LOGIN),

  register = createAction(REGISTER),

  acceptInvite = createAction(ACCEPT_INVITE),

  fetchCurrentUser = createAction(FETCH_CURRENT_USER_REQUEST),

  logout = createAction(LOGOUT),

  decrypt = createAction(DECRYPT),

  grantEnvAccessRequest = createAction(
    GRANT_ENV_ACCESS_REQUEST,
    R.pick(['envs']),
    R.pick(['orgUserId'])
  )

