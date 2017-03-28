import {delay} from 'redux-saga'
import { takeLatest, put, select, call, fork, take } from 'redux-saga/effects'
import {push, replace } from 'react-router-redux'
import R from 'ramda'
import {apiSaga, envParamsForInvitee} from './helpers'
import {
  APP_LOADED,
  FETCH_CURRENT_USER_REQUEST,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_FAILED,
  LOGIN,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  REGISTER,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILED,
  DECRYPT,
  DECRYPT_PRIVKEY,
  DECRYPT_PRIVKEY_SUCCESS,
  DECRYPT_PRIVKEY_FAILED,
  DECRYPT_ENVS,
  DECRYPT_ENVS_SUCCESS,
  DECRYPT_ENVS_FAILED,
  ACCEPT_INVITE,
  ACCEPT_INVITE_REQUEST,
  ACCEPT_INVITE_SUCCESS,
  ACCEPT_INVITE_FAILED,
  HASH_USER_PASSWORD,
  HASH_USER_PASSWORD_SUCCESS,
  GENERATE_USER_KEYPAIR,
  GENERATE_USER_KEYPAIR_SUCCESS,
  HASH_PASSWORD_AND_GENERATE_KEYS,
  HASH_PASSWORD_AND_GENERATE_KEYS_SUCCESS,
  SELECT_ORG,
  GRANT_ENV_ACCESS,
  GRANT_ENV_ACCESS_REQUEST,
  GRANT_ENV_ACCESS_SUCCESS,
  GRANT_ENV_ACCESS_FAILED,
  CHECK_INVITES_ACCEPTED_REQUEST,
  CHECK_INVITES_ACCEPTED_SUCCESS,
  CHECK_INVITES_ACCEPTED_FAILED,
  CHECK_ACCESS_GRANTED_REQUEST,
  CHECK_ACCESS_GRANTED_SUCCESS,
  CHECK_ACCESS_GRANTED_FAILED,
  appLoaded,
  login,
  selectOrg,
  decryptPrivkey,
  grantEnvAccessRequest
} from "actions"
import {
  getAuth,
  getOrgs,
  getApps,
  getAppsSortedByUpdatedAt,
  getServices,
  getPassword,
  getPrivkey,
  getEncryptedPrivkey,
  getIsDecryptingEnvs,
  getEnvsAreDecrypted,
  getInviteesNeedingAccess,
  getInviteesPendingAcceptance,
  getEnvAccessGranted,
  getCurrentRoute,
  getCurrentOrgSlug,
  getPermissions,
  getIsDemo
} from "selectors"
import * as crypto from 'lib/crypto'
import { ORG_OBJECT_TYPES_PLURALIZED } from 'constants'

function* decryptEnvs(envParents, privkey){
  const res = []

  for (let parent of envParents){
    if (parent.envsWithMeta){
      let decrypted = {}
      for (let environment in parent.envsWithMeta){
        let encrypted = parent.envsWithMeta[environment]
        decrypted[environment] = encrypted && !R.isEmpty(encrypted) ?
          (yield crypto.decryptJson({encrypted, privkey})) :
          {}
      }
      res.push(R.assoc("envsWithMeta", decrypted, parent))
    } else {
      res.push(parent)
    }
  }

  return res
}

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
  }),

  onAcceptInviteRequest = apiSaga({
    authenticated: false,
    skipOrg: true,
    method: "post",
    actionTypes: [ACCEPT_INVITE_SUCCESS, ACCEPT_INVITE_FAILED],
    urlFn: (action)=> "/users/accept_invite.json"
  }),

  onGrantEnvAccessRequest = apiSaga({
    authenticated: true,
    method: "patch",
    actionTypes: [GRANT_ENV_ACCESS_SUCCESS, GRANT_ENV_ACCESS_FAILED],
    urlFn: (action)=> `/org_users/${action.meta.orgUserId}/grant_env_access.json`
  }),

  onCheckInvitesAcceptedRequest = apiSaga({
    authenticated: true,
    method: "get",
    actionTypes: [CHECK_INVITES_ACCEPTED_SUCCESS, CHECK_INVITES_ACCEPTED_FAILED],
    urlFn: (action)=> "/users/check_invites_accepted.json"
  }),

  onCheckAccessGrantedRequest = apiSaga({
    authenticated: true,
    method: "get",
    actionTypes: [CHECK_ACCESS_GRANTED_SUCCESS, CHECK_ACCESS_GRANTED_FAILED],
    urlFn: (action)=> "/users/check_access_granted.json"
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

function *onAcceptInvite({payload}){
  document.body.className += " preloader-authenticate"
  yield call(delay, 50)

  yield put({type: HASH_PASSWORD_AND_GENERATE_KEYS, payload})

  const {payload: {hashedPassword, pubkey, encryptedPrivkey}} = yield take(HASH_PASSWORD_AND_GENERATE_KEYS_SUCCESS)

  yield put({
    type: ACCEPT_INVITE_REQUEST,
    payload: {...payload, password: hashedPassword, pubkey, encryptedPrivkey},
    meta: {rawPassword: payload.password}
  })
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
      password: hashedPassword,
      provider: "email",
      uid: payload.email
    },
    meta: {rawPassword: payload.password}
  })
}

function *onHashUserPassword({payload: {email, password}}){
  const isDemo = yield select(getIsDemo),
        hashedPassword = crypto.hashedPassword(email, password, (isDemo ? 1 : undefined))

  yield put({type: HASH_USER_PASSWORD_SUCCESS, payload: {email, hashedPassword}})
}

function *onGenerateUserKeypair({payload: {email, password}}){
  const {
    privateKeyArmored: encryptedPrivkey,
    publicKeyArmored: pubkey
  } = yield call(crypto.generateKeys, {
    id: crypto.emailHash(email),
    passphrase: password
  })

  yield put({type: GENERATE_USER_KEYPAIR_SUCCESS, payload: {encryptedPrivkey, pubkey}})
}

function *onAcceptInviteSuccess({meta: {rawPassword, requestPayload: {email, password}}}){
  yield put({type: LOGIN_REQUEST, payload: {email, password}, meta: {rawPassword}})
}

function* onLoginSuccess(action){
  const orgs = yield select(getOrgs)
  yield [
    (orgs.length == 1 ? put(selectOrg(orgs[0].slug)) : put(push("/select_org"))),
    put({type: DECRYPT_PRIVKEY, payload: action.meta.rawPassword})
  ]
}

function* onRegisterSuccess(action){
  const orgs = yield select(getOrgs)
  yield [
    put(selectOrg(orgs[0].slug)),
    put({type: DECRYPT_PRIVKEY, payload: action.meta.rawPassword})
  ]
}

function* onSelectOrg({payload: slug}){
  yield put(push(`/${slug}`))
}

function *onDecryptPrivkey({payload: passphrase}){
  const encryptedPrivkey = yield select(getEncryptedPrivkey)

  try {
    const privkey = yield crypto.decryptPrivateKey({
      privkey: encryptedPrivkey, passphrase
    })

    yield put({type: DECRYPT_PRIVKEY_SUCCESS, payload: privkey})
    yield call(dispatchDecryptEnvsIfNeeded)
  } catch (err){
    yield put({type: DECRYPT_PRIVKEY_FAILED, error: true, payload: err})
  }
}

function *onDecryptEnvs(action){
  try {
    const apps = yield select(getApps),
          services = yield select(getServices),
          privkey = yield select(getPrivkey),
          [decryptedApps, decryptedServices] = yield [
            call(decryptEnvs, apps, privkey),
            call(decryptEnvs, services, privkey)
          ]

    yield put({type: DECRYPT_ENVS_SUCCESS, payload: {
      apps: decryptedApps,
      services: decryptedServices
    }})
  } catch (err){
    yield put({type: DECRYPT_ENVS_FAILED, error: true, payload: err})
  }
}

function *onDecryptEnvsSuccess(action){
  yield [
    call(grantEnvAccessIfNeeded),
    call(checkInvitesAcceptedIfNeeded)
  ]
}

function *onDecrypt(action){
  const privkey = yield select(getPrivkey),
        encryptedPrivkey = yield select(getEncryptedPrivkey)

  if(privkey){
    yield call(dispatchDecryptEnvsIfNeeded)
  } else if (encryptedPrivkey) {
    yield put({...action, type: DECRYPT_PRIVKEY})
  }
}

function *onFetchCurrentUserSuccess(action){
  yield put(appLoaded())
  const privkey = yield select(getPrivkey)
  if(privkey)yield call(dispatchDecryptEnvsIfNeeded)
  yield [
    call(checkAccessGrantedIfNeeded),
    call(redirectFromOrgIndexIfNeeded)
  ]
}

function *redirectFromOrgIndexIfNeeded(){
  const currentRoute = yield select(getCurrentRoute),
        orgSlug = yield select(getCurrentOrgSlug),
        isOrgIndex = currentRoute.pathname == `/${orgSlug}`

  if (isOrgIndex){
    const apps = yield select(getAppsSortedByUpdatedAt),
          permissions = yield select(getPermissions)

    if (apps.length){
      yield put(replace(`/${orgSlug}/apps/${apps[0].slug}`))
    } else if (permissions.create.app){
      yield put(replace(`/${orgSlug}/onboard`))
    }
  }
}

function *dispatchDecryptEnvsIfNeeded(){
  const isDecryptingEnvs = yield select(getIsDecryptingEnvs),
        envsAreDecrypted = yield select(getEnvsAreDecrypted),
        envAccessGranted = yield select(getEnvAccessGranted)

  if(envAccessGranted && !isDecryptingEnvs && !envsAreDecrypted){
    yield put({type: DECRYPT_ENVS})
  }
}

function *grantEnvAccessIfNeeded(){
  const invitees = yield select(getInviteesNeedingAccess)
  if(invitees && invitees.length){
    yield put({type: GRANT_ENV_ACCESS, payload: invitees})
  }
}

function *onGrantEnvAccess({payload: invitees}){
  for (let invitee of invitees){
    const envs = yield call(envParamsForInvitee, invitee)
    yield put(grantEnvAccessRequest({envs, orgUserId: invitee.orgUserId}))
  }
}

function *checkInvitesAcceptedIfNeeded(){
  const inviteesPendingAcceptance = yield select(getInviteesPendingAcceptance)

  if(inviteesPendingAcceptance.length){
    yield put({type: CHECK_INVITES_ACCEPTED_REQUEST})
  }
}

function *onCheckInvitesAcceptedSuccess(action){
  yield call(grantEnvAccessIfNeeded)

  yield call(delay, 10 * 1000) // 10 second polling loop

  yield call(checkInvitesAcceptedIfNeeded)
}

function *checkAccessGrantedIfNeeded(){
  const envAccessGranted = yield select(getEnvAccessGranted)

  if(!envAccessGranted){
    yield put({type: CHECK_ACCESS_GRANTED_REQUEST})
  }
}

function *onCheckAccessGrantedSuccess(action){
  if (action.payload.envAccessGranted){
    yield put({...action, type: FETCH_CURRENT_USER_SUCCESS})
  } else {
    yield call(delay, 5 * 1000) // 5 second polling loop

    yield call(checkAccessGrantedIfNeeded)
  }
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
    takeLatest(DECRYPT_ENVS, onDecryptEnvs),
    takeLatest(DECRYPT_ENVS_SUCCESS, onDecryptEnvsSuccess),
    takeLatest(DECRYPT_PRIVKEY, onDecryptPrivkey),
    takeLatest(DECRYPT, onDecrypt),
    takeLatest(ACCEPT_INVITE, onAcceptInvite),
    takeLatest(ACCEPT_INVITE_REQUEST, onAcceptInviteRequest),
    takeLatest(ACCEPT_INVITE_SUCCESS, onAcceptInviteSuccess),
    takeLatest(HASH_USER_PASSWORD, onHashUserPassword),
    takeLatest(HASH_PASSWORD_AND_GENERATE_KEYS, onHashPasswordAndGenerateKeys),
    takeLatest(GENERATE_USER_KEYPAIR, onGenerateUserKeypair),
    takeLatest(GRANT_ENV_ACCESS, onGrantEnvAccess),
    takeLatest(GRANT_ENV_ACCESS_REQUEST, onGrantEnvAccessRequest),
    takeLatest(CHECK_INVITES_ACCEPTED_REQUEST, onCheckInvitesAcceptedRequest),
    takeLatest(CHECK_INVITES_ACCEPTED_SUCCESS, onCheckInvitesAcceptedSuccess),
    takeLatest(CHECK_ACCESS_GRANTED_REQUEST, onCheckAccessGrantedRequest),
    takeLatest(CHECK_ACCESS_GRANTED_SUCCESS, onCheckAccessGrantedSuccess)
  ]
}

