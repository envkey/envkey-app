import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  APP_LOADED,
  LOGIN,
  REGISTER,
  FETCH_CURRENT_USER_REQUEST,
  LOGOUT,
  GRANT_ENV_ACCESS_REQUEST,
  START_DEMO
} from './action_types'

export const
  appLoaded = createAction(APP_LOADED),

  login = createAction(LOGIN),

  register = createAction(REGISTER),

  fetchCurrentUser = createAction(FETCH_CURRENT_USER_REQUEST),

  logout = createAction(LOGOUT),

  grantEnvAccessRequest = createAction(
    GRANT_ENV_ACCESS_REQUEST,
    R.pick(['envs', 'orgUser']),
    R.pick(['orgUserId', 'userId', 'isInvite', 'parentId'])
  ),

  startDemo = createAction(START_DEMO)

