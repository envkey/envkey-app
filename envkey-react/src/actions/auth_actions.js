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
  LOGOUT_ALL,
  SELECT_ACCOUNT,
  START_DEMO,
  SET_DEMO_DOWNLOAD_URL,
  RESET_SESSION
} from './action_types'

export const
  appLoaded = createAction(APP_LOADED),

  verifyEmailRequest = createAction(VERIFY_EMAIL_REQUEST),

  verifyEmailCodeRequest = createAction(VERIFY_EMAIL_CODE_REQUEST),

  resetVerifyEmail = createAction(RESET_VERIFY_EMAIL),

  login = createAction(
    LOGIN,
    R.pick(["email", "emailVerificationCode"]),
    R.pick(["password", "orgSlug"])
  ),

  register = createAction(REGISTER),

  selectAccount = createAction(
    SELECT_ACCOUNT,
    R.pick(["auth", "privkey"]),
    ({auth})=> ({accountId: auth.id})
  ),

  fetchCurrentUser = createAction(FETCH_CURRENT_USER_REQUEST),

  fetchCurrentUserUpdates = createAction(FETCH_CURRENT_USER_UPDATES_REQUEST, R.always({}), R.pick(["noMinUpdatedAt"])),

  logout = createAction(LOGOUT, R.always({}), R.pick(["accountId"])),

  logoutAll = createAction(LOGOUT_ALL),

  startDemo = createAction(START_DEMO),

  setDemoDownloadUrl = createAction(SET_DEMO_DOWNLOAD_URL),

  resetSession = createAction(RESET_SESSION)

