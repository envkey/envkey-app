import {delay} from 'redux-saga'
import { takeLatest, takeEvery, put, select, call, fork, take } from 'redux-saga/effects'
import {push } from 'react-router-redux'
import R from 'ramda'
import {
  apiSaga,
  redirectFromOrgIndexIfNeeded,
  decryptPrivkeyAndDecryptAllIfNeeded,
  dispatchDecryptAllIfNeeded,
  execUpdateTrustedPubkeys
} from './helpers'
import {
  APP_LOADED,
  FETCH_CURRENT_USER_REQUEST,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_FAILED,
  FETCH_CURRENT_USER_UPDATES_REQUEST,
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
  LOGOUT,
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
  appLoaded,
  login,
  selectOrg,
  socketUnsubscribeAll,
  addTrustedPubkey,
  decryptPrivkey
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
  getIsDecryptingEnvs,
  getEnvsAreDecrypted,
  getInviteesNeedingAccess,
  getInviteesPendingAcceptance,
  getIsDemo,
  getUser,
  getCurrentUser
} from "selectors"
import * as crypto from 'lib/crypto'
import { ORG_OBJECT_TYPES_PLURALIZED } from 'constants'

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
    actionTypes: [FETCH_CURRENT_USER_UPDATES_SUCCESS, FETCH_CURRENT_USER_UPDATES_FAILED],
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
  })

function *onAppLoaded(){
  document.getElementById("preloader-overlay").className += " hide"
  document.body.className = document.body.className.replace("no-scroll","")
}

function *onVerifyEmailFailed({payload, meta: {status, message}}){
  if (status == 422 && message == "invite_pending"){
    yield put(push("/accept_invite"))
  }
}

function *onLogin({payload}){
  document.body.className += " preloader-authenticate"
  yield call(delay, 50)
  yield put({
    type: LOGIN_REQUEST,
    payload
  })
}

function* onLoginSuccess({meta: {password, orgSlug}}){
  if (password){
    yield put(decryptPrivkey({password: password}))
    yield take(DECRYPT_PRIVKEY_SUCCESS)
  }

  if (orgSlug){
    yield put(selectOrg(orgSlug))
  } else {
    const orgs = yield select(getOrgs)
    yield (
      orgs.length == 1 && orgs[0].isActive ?
        put(selectOrg(orgs[0].slug)) :
        put(push("/select_org"))
    )
  }
}

function *onRegister({payload}){
  document.body.className += " preloader-register"

  const isDemo = yield select(getIsDemo)

  if (!isDemo) yield call(delay, 500)

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

function *onFetchCurrentUserSuccess(action){
  yield put(appLoaded())
  yield [
    put({type: SOCKET_SUBSCRIBE_ORG_CHANNEL}),
    call(dispatchDecryptAllIfNeeded),
    call(redirectFromOrgIndexIfNeeded)
  ]
}

function *onLogout(action){
  yield put(socketUnsubscribeAll())
}

export default function* authSagas(){
  yield [
    takeLatest(APP_LOADED, onAppLoaded),
    takeLatest(FETCH_CURRENT_USER_REQUEST, onFetchCurrentUserRequest),
    takeLatest(FETCH_CURRENT_USER_SUCCESS, onFetchCurrentUserSuccess),
    takeLatest(VERIFY_EMAIL_REQUEST, onVerifyEmailRequest),
    takeLatest(VERIFY_EMAIL_FAILED, onVerifyEmailFailed),
    takeLatest(VERIFY_EMAIL_CODE_REQUEST, onVerifyEmailCodeRequest),
    takeLatest(LOGIN, onLogin),
    takeLatest(LOGIN_REQUEST, onLoginRequest),
    takeLatest(LOGIN_SUCCESS, onLoginSuccess),
    takeLatest(REGISTER, onRegister),
    takeLatest(REGISTER_REQUEST, onRegisterRequest),
    takeLatest(REGISTER_SUCCESS, onRegisterSuccess),
    takeLatest(SELECT_ORG, onSelectOrg),

    takeLatest(LOGOUT, onLogout)
  ]
}

