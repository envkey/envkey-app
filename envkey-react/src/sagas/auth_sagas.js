import R from 'ramda'
import { delay } from 'redux-saga'
import { takeLatest, put, select, call, take } from 'redux-saga/effects'
import { push } from 'react-router-redux'
import {
  redirectFromOrgIndexIfNeeded,
  apiSaga
} from './helpers'
import {
  APP_LOADED,
  REACTIVATED_BRIEF,
  REACTIVATED_LONG,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_FAILED,
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS,
  FETCH_CURRENT_USER_UPDATES_SUCCESS,
  FETCH_CURRENT_USER_UPDATES_FAILED,
  VERIFY_EMAIL_FAILED,
  LOGIN,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  SELECT_ACCOUNT_SUCCESS,
  SELECT_ACCOUNT_FAILED,
  ACCOUNT_RESET_OPTIONS_REQUEST,
  ACCOUNT_RESET_OPTIONS_SUCCESS,
  ACCOUNT_RESET_OPTIONS_FAILED,
  LOGOUT,
  RESET_SESSION,
  REGISTER,
  REGISTER_SUCCESS,
  REGISTER_FAILED,
  SELECT_ORG,
  SOCKET_SUBSCRIBE_ORG_CHANNEL,
  START_DEMO,
  UPDATE_TRUSTED_PUBKEYS_SUCCESS,
  API_FAILED,
  appLoaded,
  login,
  socketUnsubscribeAll,
  fetchCurrentUserUpdates
} from "actions"
import {
  getCurrentOrg,
  getOrgs,
  getOrgBySlug,
  getLastFetchAt
} from "selectors"

import {setAuthenticatingOverlay, clearAuthenticatingOverlay} from 'lib/ui'
import { isTimeout } from 'envkey-client-core/dist/lib/actions'

const
  onAccountResetOptionsRequest = apiSaga({
    authenticated: true,
    method: "get",
    skipOrg: true,
    actionTypes: [ACCOUNT_RESET_OPTIONS_SUCCESS, ACCOUNT_RESET_OPTIONS_FAILED],
    urlFn: action => "/users/reset_options.json"
  })

function *loginSelectOrg(){
  clearAuthenticatingOverlay()
  yield put(push("/select_org"))
}

function *onAppLoaded(){
  clearAuthenticatingOverlay()
}

function *onReactivatedBrief(){
  // assuming we've already done a fetch, get updates in background since we were supsended less than a minute
  const lastFetchAt = yield select(getLastFetchAt)

  if (lastFetchAt){
    yield put(fetchCurrentUserUpdates({noMinUpdatedAt: true}))
  }
}

function *onReactivatedLong(){
  // assuming we've already done a fetch, since we were suspended for more than a minute, do a hard refresh here to ensure we're fully updated before taking any action
  const lastFetchAt = yield select(getLastFetchAt)

  if (lastFetchAt){
    window.location.reload()
  }
}

function *onVerifyEmailFailed({payload, meta: {status, message}}){
  if (status == 422 && message == "invite_pending"){
    yield put(push("/accept_invite"))
  }
}

function *onLogin(action){
  yield call(delay, 50)
  setAuthenticatingOverlay()
}

function* onLoginSuccess({meta: {password, orgSlug}}){
  if (!orgSlug){
    const orgs = yield select(getOrgs)
    if (!(orgs.length == 1 && orgs[0].isActive)){
      yield call(loginSelectOrg)
    }
  }
}

function *onRegister({payload}){
  yield call(delay, 500)
}

function* onRegisterSuccess({meta: {password, requestPayload: {pubkey}}}){
  const currentOrg = yield select(getCurrentOrg)

  yield take(UPDATE_TRUSTED_PUBKEYS_SUCCESS)
  yield put(push(`/${currentOrg.slug}`))
  yield put({type: SOCKET_SUBSCRIBE_ORG_CHANNEL})
  yield call(redirectFromOrgIndexIfNeeded)
}

function* onStartDemo({payload: {email, token, password}}){
  // 'password' below is stored in action.meta, not sent to server -- allows decryption after login
  yield put(login({email, emailVerificationCode: token, password}))

  const res = yield take([LOGIN_SUCCESS, LOGIN_FAILED])

  if (res.type == LOGIN_FAILED){
    yield put(push("/home"))
  }
}

function* onSelectOrg({payload: slug}){
  yield put(socketUnsubscribeAll())
  const org = yield select(getOrgBySlug(slug))

  if (org.isActive){
    yield put(push(`/${slug}`))
  } else if (org.status == "invited"){
    yield put(push("/accept_invite"))
  } else {
    yield put(push("/invite_failed"))
  }
}

function* onSelectAccountSuccess(){
  const orgs = yield select(getOrgs)

  if (!(orgs.length == 1 && orgs[0].isActive)){
    yield call(loginSelectOrg)
  }
}

function *onFetchCurrentUserSuccess(action){
  yield put(appLoaded())
  yield [
    put({type: SOCKET_SUBSCRIBE_ORG_CHANNEL}),
    call(redirectFromOrgIndexIfNeeded)
  ]
}

function *onFetchCurrentUserFailed(action){
  if (isTimeout(action)){
    console.log("API call to server timed out. Refreshing...")
    window.location.reload()
  } else {
    yield put(push("/home"))
  }
}

function *onFetchCurrentUserUpdatesApiSuccess({payload}){
  if (payload.apps && payload.apps.length > 0){
    yield call(delay, 100)
  }
}

function *onResetSession(action){
  yield put(socketUnsubscribeAll())
}

function *onSelectAccountFailed(action){
  yield put(push("login"))
}

function *onAuthFailed(action){
  clearAuthenticatingOverlay()
}

function *onApiFailed({payload, meta}){
  if (R.path(["response", "status"], payload) == 403 && meta.message == "Unauthorized IP"){
    alert(`This Org does not allow EnvKey App requests from your current IP (${payload.response.data.ip}).`)
  }
}

export default function* authSagas(){
  yield [
    takeLatest(APP_LOADED, onAppLoaded),
    takeLatest(REACTIVATED_BRIEF, onReactivatedBrief),
    takeLatest(REACTIVATED_LONG, onReactivatedLong),
    takeLatest(FETCH_CURRENT_USER_SUCCESS, onFetchCurrentUserSuccess),
    takeLatest(FETCH_CURRENT_USER_FAILED, onFetchCurrentUserFailed),
    takeLatest(FETCH_CURRENT_USER_UPDATES_API_SUCCESS, onFetchCurrentUserUpdatesApiSuccess),
    takeLatest(VERIFY_EMAIL_FAILED, onVerifyEmailFailed),
    takeLatest(LOGIN, onLogin),
    takeLatest(LOGIN_SUCCESS, onLoginSuccess),
    takeLatest(REGISTER, onRegister),
    takeLatest(REGISTER_SUCCESS, onRegisterSuccess),
    takeLatest(SELECT_ACCOUNT_SUCCESS, onSelectAccountSuccess),
    takeLatest(SELECT_ORG, onSelectOrg),
    takeLatest(ACCOUNT_RESET_OPTIONS_REQUEST, onAccountResetOptionsRequest),
    takeLatest(START_DEMO, onStartDemo),
    takeLatest(SELECT_ACCOUNT_FAILED, onSelectAccountFailed),
    takeLatest([LOGOUT, RESET_SESSION], onResetSession),
    takeLatest([SELECT_ACCOUNT_FAILED, LOGIN_FAILED, REGISTER_FAILED], onAuthFailed),
    takeLatest(API_FAILED, onApiFailed)
  ]
}

