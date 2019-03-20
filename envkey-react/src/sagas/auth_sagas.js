import R from 'ramda'
import { delay } from 'redux-saga'
import { takeLatest, put, select, call, take } from 'redux-saga/effects'
import { push } from 'react-router-redux'
import {
  redirectFromOrgIndexIfNeeded,
  apiSaga
} from './helpers'
import {
  ActionType,
  appLoaded,
  login,
  socketUnsubscribeAll,
  fetchCurrentUserUpdates
} from "actions"
import {
  getCurrentOrg,
  getOrgs,
  getOrgBySlug,
  getAppLoaded
} from "selectors"
import {setAuthenticatingOverlay, clearAuthenticatingOverlay} from 'lib/ui'
import { isTimeout } from 'envkey-client-core/dist/lib/actions'

const
  onAccountResetOptionsRequest = apiSaga({
    authenticated: true,
    method: "get",
    skipOrg: true,
    actionTypes: [ActionType.ACCOUNT_RESET_OPTIONS_SUCCESS, ActionType.ACCOUNT_RESET_OPTIONS_FAILED],
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
  const
    state = yield select(),
    lastFetchAt = state.lastFetchAt

  if (lastFetchAt){
    yield put(fetchCurrentUserUpdates({noMinUpdatedAt: true}))
  }
}

function *onVerifyEmailCodeSuccess(){
  yield put(push("/register"))
}

function *onReactivatedLong(){
  // assuming we've already done a fetch, since we were suspended for more than a minute, do a hard refresh here to ensure we're fully updated before taking any action
  const
    state = yield select(),
    lastFetchAt = state.lastFetchAt

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

function* onLoginSuccess({meta: {orgSlug}}){
  // When trying to sign up via OAuth with an existing user, userId will be present.
  // Ask the user to select the organization (or create a new one.)
  const authSession = yield select(state => state.verifiedExternalAuthSession)
  if (authSession &&
    authSession.authType === "sign_up" &&
    authSession.userId
  ) {
    yield call(loginSelectOrg)
    return
  }

  if (!orgSlug) {
    const orgs = yield select(getOrgs)
    if (!(orgs.length == 1 && orgs[0].isActive)){
      yield call(loginSelectOrg)
    }
  }
}

function* onFetchVerifiedExternalAuthSessionSuccess(action) {
  window.ipc.send("focusMainWindow")

  if (action.payload.authType == "sign_up") {
    // If there was an existing user for this OAuth account, we login first
    // (in envkey-client-core / auth_sagas.ts / onStartExternalAuthSessionSuccess)
    // Then we skip the default org selection in onLoginSuccess,
    // and redirect to /select_org.
    if (action.payload.userId != null) {
      return
    }

    yield put(push("/register"))
  }
}

// Focus the app when showing an external auth error
function* onFetchVerifiedExternalAuthSessionFailed(action) {
  if (action.meta.status != 404) {
    window.ipc.send("focusMainWindow")
  }
}

function *onRegister({payload}){
  yield call(delay, 500)
}

function* onRegisterSuccess({meta: {requestPayload: {pubkey}}}){
  const currentOrg = yield select(getCurrentOrg)

  yield put(push(`/${currentOrg.slug}`))
  yield put({ type: ActionType.SOCKET_SUBSCRIBE_ORG_CHANNEL})
  yield call(redirectFromOrgIndexIfNeeded)
}


function* onStartDemo({payload: {email, token, passphrase}}){
  // 'passphrase' below is stored in action.meta, not sent to server -- allows decryption after login
  yield put(login({email, emailVerificationCode: token, passphrase}))

  const res = yield take([ActionType.LOGIN_SUCCESS, ActionType.LOGIN_FAILED])

  if (res.type == ActionType.LOGIN_FAILED){
    yield put(push("/home"))
  }
}

function* onSelectOrg({payload: slug}){
  yield put(socketUnsubscribeAll())
  const org = yield select(getOrgBySlug(slug))

  if (!org){
    return
  }

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

function *onFetchCurrentUserMenuSuccess(action){
  const appAlreadyLoaded = yield select(getAppLoaded)
  if (appAlreadyLoaded){
    clearAuthenticatingOverlay()
  } else {
    yield put(appLoaded())
  }
  yield [
    // put({type: SOCKET_SUBSCRIBE_ORG_CHANNEL}),
    call(redirectFromOrgIndexIfNeeded)
  ]
}

function *onFetchCurrentUserMenuFailed(action){
  const status = R.path(["payload", "response", "status"], action)

  if (isTimeout(action)){
    console.log("API call to server timed out. Refreshing...")
    window.location.reload()
  } else if (status == 500){
    console.log("Server error...")
    window.alert("A server error prevented EnvKey from loading your data. If the problem persists, please contact support@envkey.com")
    yield put(push("/home"))
  } else if (status && !([404,403,401].includes(status))){
    console.log("API call failed. Refreshing...")
    window.location.reload()
  } else if (status) {
    yield put(push("/home"))
  } else {
    window.alert(`There was an error rendering your data. Please contact support@envkey.com. Error:\n${payload}`)
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
    takeLatest(ActionType.APP_LOADED, onAppLoaded),
    takeLatest(ActionType.REACTIVATED_BRIEF, onReactivatedBrief),
    takeLatest(ActionType.REACTIVATED_LONG, onReactivatedLong),
    takeLatest(ActionType.FETCH_CURRENT_USER_MENU_SUCCESS, onFetchCurrentUserMenuSuccess),
    takeLatest(ActionType.FETCH_CURRENT_USER_MENU_FAILED, onFetchCurrentUserMenuFailed),
    takeLatest(ActionType.VERIFY_EMAIL_FAILED, onVerifyEmailFailed),
    takeLatest(ActionType.LOGIN, onLogin),
    takeLatest(ActionType.LOGIN_SUCCESS, onLoginSuccess),
    takeLatest(ActionType.FETCH_VERIFIED_EXTERNAL_AUTH_SESSION_SUCCESS, onFetchVerifiedExternalAuthSessionSuccess),
    takeLatest(ActionType.FETCH_VERIFIED_EXTERNAL_AUTH_SESSION_FAILED, onFetchVerifiedExternalAuthSessionFailed),
    takeLatest(ActionType.VERIFY_EMAIL_CODE_SUCCESS, onVerifyEmailCodeSuccess),
    takeLatest(ActionType.REGISTER, onRegister),
    takeLatest(ActionType.REGISTER_SUCCESS, onRegisterSuccess),
    takeLatest(ActionType.SELECT_ACCOUNT_SUCCESS, onSelectAccountSuccess),
    takeLatest(ActionType.SELECT_ORG, onSelectOrg),
    takeLatest(ActionType.ACCOUNT_RESET_OPTIONS_REQUEST, onAccountResetOptionsRequest),
    takeLatest(ActionType.START_DEMO, onStartDemo),
    takeLatest(ActionType.SELECT_ACCOUNT_FAILED, onSelectAccountFailed),
    takeLatest([ActionType.LOGOUT, ActionType.RESET_SESSION], onResetSession),
    takeLatest([ActionType.SELECT_ACCOUNT_FAILED, ActionType.LOGIN_FAILED, ActionType.REGISTER_FAILED], onAuthFailed),
    takeLatest(ActionType.API_FAILED, onApiFailed)
  ]
}

