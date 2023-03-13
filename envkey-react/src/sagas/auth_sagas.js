import { delay } from 'redux-saga'
import { takeLatest, takeEvery, put, select, call, fork, take } from 'redux-saga/effects'
import { push } from 'react-router-redux'
import R from 'ramda'
import {
  apiSaga,
  redirectFromOrgIndexIfNeeded,
  decryptPrivkeyAndDecryptAllIfNeeded,
  dispatchDecryptAllIfNeeded,
  decryptAllEnvParents,
  execUpdateTrustedPubkeys
} from './helpers'
import {
  APP_LOADED,
  REACTIVATED_BRIEF,
  REACTIVATED_LONG,
  FETCH_CURRENT_USER_REQUEST,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_FAILED,
  FETCH_CURRENT_USER_UPDATES_REQUEST,
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS,
  FETCH_CURRENT_USER_UPDATES_SUCCESS,
  FETCH_CURRENT_USER_UPDATES_FAILED,
  VERIFY_EMAIL_REQUEST,
  VERIFY_EMAIL_SUCCESS,
  VERIFY_EMAIL_FAILED,
  VERIFY_EMAIL_CODE_REQUEST,
  VERIFY_EMAIL_CODE_SUCCESS,
  VERIFY_EMAIL_CODE_FAILED,
  LOGIN,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  SELECT_ACCOUNT,
  SELECT_ACCOUNT_REQUEST,
  SELECT_ACCOUNT_SUCCESS,
  SELECT_ACCOUNT_FAILED,
  ACCOUNT_RESET_OPTIONS_REQUEST,
  ACCOUNT_RESET_OPTIONS_SUCCESS,
  ACCOUNT_RESET_OPTIONS_FAILED,
  LOGOUT,
  RESET_SESSION,
  REGISTER,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILED,
  HASH_USER_PASSWORD,
  HASH_USER_PASSWORD_SUCCESS,
  HASH_PASSWORD_AND_GENERATE_KEYS,
  HASH_PASSWORD_AND_GENERATE_KEYS_SUCCESS,
  GENERATE_USER_KEYPAIR,
  GENERATE_USER_KEYPAIR_SUCCESS,
  SELECT_ORG,
  SOCKET_SUBSCRIBE_ORG_CHANNEL,
  DECRYPT_PRIVKEY_SUCCESS,
  VERIFY_ORG_PUBKEYS_SUCCESS,
  START_DEMO,
  DECRYPT_ALL_SUCCESS,
  API_FAILED,
  appLoaded,
  login,
  logout,
  selectOrg,
  socketUnsubscribeAll,
  addTrustedPubkey,
  decryptPrivkey,
  verifyOrgPubkeys,
  fetchCurrentUserUpdates,
  startV2Upgrade
} from "actions"
import {
  getAuth,
  getCurrentOrg,
  getOrgs,
  getOrgBySlug,
  getApps,
  getPassword,
  getPrivkey,
  getEncryptedPrivkey,
  getIsDecryptingAll,
  getIsDecrypting,
  getDecryptedAll,
  getInviteesNeedingAccess,
  getInviteesPendingAcceptance,
  getUser,
  getCurrentUser,
  getLastFetchAt,
  getAppLoaded
} from "selectors"
import * as crypto from 'lib/crypto'
import { ORG_OBJECT_TYPES_PLURALIZED } from 'constants'
import {setAuthenticatingOverlay, clearAuthenticatingOverlay} from 'lib/ui'
import { isTimeout } from 'lib/actions'

const
  onFetchCurrentUserRequest = apiSaga({
    authenticated: true,
    method: "get",
    actionTypes: [FETCH_CURRENT_USER_SUCCESS, FETCH_CURRENT_USER_FAILED],
    urlSelector: getAuth,
    urlFn: (action, auth)=> `/users/${auth.id}.json`
  }),

  onFetchCurrentUserUpdatesRequest = apiSaga({
    authenticated: true,
    method: "get",
    actionTypes: [FETCH_CURRENT_USER_UPDATES_API_SUCCESS, FETCH_CURRENT_USER_UPDATES_FAILED],
    urlSelector: getAuth,
    urlFn: (action, auth)=> `/users/${auth.id}.json`
  }),

  onVerifyEmailRequest = apiSaga({
    authenticated: false,
    method: "post",
    actionTypes: [VERIFY_EMAIL_SUCCESS, VERIFY_EMAIL_FAILED],
    urlFn: action => "/email_verifications.json"
  }),

  onVerifyEmailCodeRequest = apiSaga({
    authenticated: false,
    method: "post",
    actionTypes: [VERIFY_EMAIL_CODE_SUCCESS, VERIFY_EMAIL_CODE_FAILED],
    urlFn: action => "/email_verifications/check_valid.json"
  }),

  onLoginRequest = apiSaga({
    authenticated: false,
    method: "post",
    actionTypes: [LOGIN_SUCCESS, LOGIN_FAILED],
    urlFn: (action)=> "/auth/sign_in.json"
  }),

  onRegisterRequest = apiSaga({
    authenticated: false,
    method: "post",
    actionTypes: [REGISTER_SUCCESS, REGISTER_FAILED],
    urlFn: (action)=> "/auth.json"
  }),

  onSelectAccountRequest = apiSaga({
    authenticated: true,
    method: "get",
    actionTypes: [SELECT_ACCOUNT_SUCCESS, SELECT_ACCOUNT_FAILED],
    urlFn: (action)=> "/auth/session.json"
  }),

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
  const isDecrypting = yield select(getIsDecrypting)
  const isDecryptingAll = yield select(getIsDecryptingAll)
  const decrypted = yield select(getDecryptedAll)


  if (lastFetchAt && decrypted && !isDecrypting && !isDecryptingAll){
    yield put(fetchCurrentUserUpdates({noMinUpdatedAt: true}))
  }
}

function *onReactivatedLong(){
  // assuming we've already done a fetch, since we were suspended for more than a minute, do a hard refresh here to ensure we're fully updated before taking any action
  const lastFetchAt = yield select(getLastFetchAt)
  const isDecrypting = yield select(getIsDecrypting)
  const isDecryptingAll = yield select(getIsDecryptingAll)
  const decrypted = yield select(getDecryptedAll)

  if (lastFetchAt && decrypted && !isDecrypting && !isDecryptingAll){
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
  yield put({
    ...action,
    type: LOGIN_REQUEST
  })
}

function* onLoginSuccess({meta: {password, orgSlug}}){
  if (orgSlug){
    yield put(selectOrg(orgSlug))
  } else {
    const orgs = yield select(getOrgs)

    yield (
      orgs.length == 1 && orgs[0].isActive ?
        put(selectOrg(orgs[0].slug)) :
        call(loginSelectOrg)
    )
  }

  if (password){
    yield take(FETCH_CURRENT_USER_SUCCESS)
    yield put(decryptPrivkey({password: password}))
    yield take(DECRYPT_PRIVKEY_SUCCESS)
    yield call(dispatchDecryptAllIfNeeded)
  }
}

function *onRegister({payload}){
  yield call(delay, 500)

  yield put({type: GENERATE_USER_KEYPAIR, payload})

  const {payload: {pubkey, encryptedPrivkey}} = yield take(GENERATE_USER_KEYPAIR_SUCCESS)

  yield put({
    type: REGISTER_REQUEST,
    payload: {
      ...R.omit(["password"], payload),
      pubkey,
      encryptedPrivkey,
      pubkeyFingerprint: crypto.getPubkeyFingerprint(pubkey),
      provider: "email",
      uid: payload.email
    },
    meta: {password: payload.password}
  })
}

function* onRegisterSuccess({meta: {password, requestPayload: {pubkey}}}){

  const currentOrg = yield select(getCurrentOrg),
        currentUser = yield select(getCurrentUser),
        [ , decryptPrivkeyResult] = yield [
          put(addTrustedPubkey({keyable: {type: "user", ...currentUser, pubkey}, orgId: currentOrg.id})),
          call(decryptPrivkeyAndDecryptAllIfNeeded, password)
        ]

  if (!decryptPrivkeyResult.error){
    const updateTrustedRes = yield call(execUpdateTrustedPubkeys, currentOrg.slug)
    if (!updateTrustedRes.error){
      yield put(push(`/${currentOrg.slug}`))
      yield put({type: SOCKET_SUBSCRIBE_ORG_CHANNEL})
      yield call(redirectFromOrgIndexIfNeeded)
    }
  }
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

function* onSelectAccount({meta}){
  yield put({meta, type: SELECT_ACCOUNT_REQUEST})
}

function* onSelectAccountSuccess(){
  const orgs = yield select(getOrgs)

  yield (
    orgs.length == 1 && orgs[0].isActive ?
      put(selectOrg(orgs[0].slug)) :
      call(loginSelectOrg)
  )
}

function *onFetchCurrentUserSuccess({payload}){
  yield put(appLoaded())
  yield [
    put({type: SOCKET_SUBSCRIBE_ORG_CHANNEL}),
    call(dispatchDecryptAllIfNeeded),
    call(redirectFromOrgIndexIfNeeded)
  ]

  if (payload.apps && payload.apps.length > 0){
    yield take(DECRYPT_ALL_SUCCESS)
  } else if ((payload.users && payload.users.length > 0) ||
      (payload.servers && payload.servers.length > 0) ||
      (payload.localKeys && payload.localKeys.length > 0)){
    yield take(VERIFY_ORG_PUBKEYS_SUCCESS)
  }

  // resume interrupted v2 upgrade if needed
  const currentOrg = yield select(getCurrentOrg)
  const currentUser = yield select(getCurrentUser)
  if (currentUser.role == "org_owner" &&
      currentOrg.isUpgradingV2At &&
      !currentOrg.didUpgradeV2At &&
      !currentOrg.didCancelV2UpgradeAt){

    yield put(startV2Upgrade({resume: true}))
  }
}

function *onFetchCurrentUserFailed(action){
  if (isTimeout(action)){
    console.log("API call to server timed out. Refreshing...")
    window.location.reload()
  } else {
    yield put(logout())
    yield put(push("/home"))
  }
}

function *onFetchCurrentUserUpdatesApiSuccess({payload}){
  if (payload.apps && payload.apps.length > 0){
    yield call(delay, 100)
    yield call(dispatchDecryptAllIfNeeded, true)
    yield take(DECRYPT_ALL_SUCCESS)
  } else if ((payload.users && payload.users.length > 0) ||
      (payload.servers && payload.servers.length > 0) ||
      (payload.localKeys && payload.localKeys.length > 0)){
    yield put(verifyOrgPubkeys())
    yield take(VERIFY_ORG_PUBKEYS_SUCCESS)
  }

  yield put({type: FETCH_CURRENT_USER_UPDATES_SUCCESS})

  // resume interrupted v2 upgrade if needed
  const currentOrg = yield select(getCurrentOrg)
  const currentUser = yield select(getCurrentUser)
  if (currentUser.role == "org_owner" &&
      currentOrg.isUpgradingV2At &&
      !currentOrg.didUpgradeV2At &&
      !currentOrg.didCancelV2UpgradeAt){

    yield put(startV2Upgrade({resume: true}))
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
    takeLatest(FETCH_CURRENT_USER_REQUEST, onFetchCurrentUserRequest),
    takeLatest(FETCH_CURRENT_USER_UPDATES_REQUEST, onFetchCurrentUserUpdatesRequest),
    takeLatest(FETCH_CURRENT_USER_SUCCESS, onFetchCurrentUserSuccess),
    takeLatest(FETCH_CURRENT_USER_FAILED, onFetchCurrentUserFailed),
    takeLatest(FETCH_CURRENT_USER_UPDATES_API_SUCCESS, onFetchCurrentUserUpdatesApiSuccess),
    takeLatest(VERIFY_EMAIL_REQUEST, onVerifyEmailRequest),
    takeLatest(VERIFY_EMAIL_FAILED, onVerifyEmailFailed),
    takeLatest(VERIFY_EMAIL_CODE_REQUEST, onVerifyEmailCodeRequest),
    takeLatest(LOGIN, onLogin),
    takeLatest(LOGIN_REQUEST, onLoginRequest),
    takeLatest(LOGIN_SUCCESS, onLoginSuccess),
    takeLatest(REGISTER, onRegister),
    takeLatest(REGISTER_REQUEST, onRegisterRequest),
    takeLatest(REGISTER_SUCCESS, onRegisterSuccess),
    takeLatest(SELECT_ACCOUNT, onSelectAccount),
    takeLatest(SELECT_ACCOUNT_REQUEST, onSelectAccountRequest),
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

