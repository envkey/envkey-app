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
  getApps,
  getServices,
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

function *onLogin({payload}){
  document.body.className += " preloader-authenticate"
  yield call(delay, 50)
  yield put({type: HASH_USER_PASSWORD, payload})
  const {payload: {hashedPassword}} = yield take(HASH_USER_PASSWORD_SUCCESS)
  yield put({
    type: LOGIN_REQUEST,
    payload: {...payload, password: hashedPassword},
    meta: {rawPassword: payload.password}
  })
}

function* onLoginSuccess({meta: {rawPassword, orgSlug}}){
  yield put(decryptPrivkey({password: rawPassword}))

  yield take(DECRYPT_PRIVKEY_SUCCESS)

  if (orgSlug){
    yield put(selectOrg(orgSlug))
  } else {
    const orgs = yield select(getOrgs)
    yield (
      orgs.length == 1 ?
        put(selectOrg(orgs[0].slug)) :
        put(push("/select_org"))
    )
  }
}

function *onHashPasswordAndGenerateKeys({payload}){
  yield [
    put({type: HASH_USER_PASSWORD, payload}),
    put({type: GENERATE_USER_KEYPAIR, payload})
  ]

  const [{payload: {hashedPassword}}, {payload: {pubkey, encryptedPrivkey}}] = yield [
    take(HASH_USER_PASSWORD_SUCCESS),
    take(GENERATE_USER_KEYPAIR_SUCCESS)
  ]

  yield put({type: HASH_PASSWORD_AND_GENERATE_KEYS_SUCCESS, payload: {hashedPassword, pubkey, encryptedPrivkey}})
}


function *onRegister({payload}){
  document.body.className += " preloader-register"

  const isDemo = yield select(getIsDemo)

  if (!isDemo) yield call(delay, 500)

  yield put({type: HASH_PASSWORD_AND_GENERATE_KEYS, payload})

  const {payload: {hashedPassword, pubkey, encryptedPrivkey}} = yield take(HASH_PASSWORD_AND_GENERATE_KEYS_SUCCESS)

  yield put({
    type: REGISTER_REQUEST,
    payload: {
      ...payload,
      pubkey,
      encryptedPrivkey,
      pubkeyFingerprint: crypto.getPubkeyFingerprint(pubkey),
      password: hashedPassword,
      provider: "email",
      uid: payload.email
    },
    meta: {rawPassword: payload.password}
  })
}

function* onRegisterSuccess({meta: {rawPassword, requestPayload: {pubkey}}}){
  const orgs = yield select(getOrgs),
        currentUser = yield select(getCurrentUser),
        [ , decryptPrivkeyResult] = yield [
          put(addTrustedPubkey({keyable: {type: "user", ...currentUser, pubkey}, orgId: orgs[0].id})),
          call(decryptPrivkeyAndDecryptAllIfNeeded, rawPassword)
        ]

  if (!decryptPrivkeyResult.error){
    const updateTrustedRes = yield call(execUpdateTrustedPubkeys, orgs[0].slug)
    if (!updateTrustedRes.error){
      yield put(selectOrg(orgs[0].slug))
    }
  }
}

function *onHashUserPassword({payload: {email, password}}){
  const isDemo = yield select(getIsDemo),
        hashedPassword = crypto.hashedPassword(email, password, (isDemo ? 1 : undefined))

  yield put({type: HASH_USER_PASSWORD_SUCCESS, payload: {email, hashedPassword}})
}

function* onSelectOrg({payload: slug}){
  yield put(socketUnsubscribeAll())
  yield put(push(`/${slug}`))
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
    takeLatest(LOGIN, onLogin),
    takeLatest(LOGIN_REQUEST, onLoginRequest),
    takeLatest(LOGIN_SUCCESS, onLoginSuccess),
    takeLatest(REGISTER, onRegister),
    takeLatest(REGISTER_REQUEST, onRegisterRequest),
    takeLatest(REGISTER_SUCCESS, onRegisterSuccess),
    takeLatest(SELECT_ORG, onSelectOrg),

    takeLatest(LOGOUT, onLogout),
    takeLatest(HASH_USER_PASSWORD, onHashUserPassword),
    takeLatest(HASH_PASSWORD_AND_GENERATE_KEYS, onHashPasswordAndGenerateKeys)
  ]
}

