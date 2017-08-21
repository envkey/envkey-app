import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  APP_LOADED,
  VERIFY_EMAIL_REQUEST,
  VERIFY_EMAIL_CODE_REQUEST,
  RESET_VERIFY_EMAIL,
  LOGIN,
  LOGIN_REQUEST,
  REGISTER,
  FETCH_CURRENT_USER_REQUEST,
  FETCH_CURRENT_USER_UPDATES_REQUEST,
  LOGOUT,
  GRANT_ENV_ACCESS_REQUEST,
  START_DEMO
} from './action_types'

export const
  appLoaded = createAction(APP_LOADED),

  verifyEmailRequest = createAction(VERIFY_EMAIL_REQUEST),

  verifyEmailCodeRequest = createAction(VERIFY_EMAIL_CODE_REQUEST),

  resetVerifyEmail = createAction(RESET_VERIFY_EMAIL),

  login = createAction(LOGIN),

  register = createAction(REGISTER),

  fetchCurrentUser = createAction(FETCH_CURRENT_USER_REQUEST),

  fetchCurrentUserUpdates = createAction(FETCH_CURRENT_USER_UPDATES_REQUEST, R.always({}), R.pick(["noMinUpdatedAt"])),

  logout = createAction(LOGOUT),

  grantEnvAccessRequest = createAction(
    GRANT_ENV_ACCESS_REQUEST,
    R.pick(['envs', 'orgUser']),
    R.pick(['orgUserId', 'userId', 'isInvite', 'parentId'])
  ),

  startDemo = createAction(START_DEMO)

