import { takeLatest, put, select, call, take } from 'redux-saga/effects'
import {push} from 'react-router-redux'
import R from 'ramda'
import {apiSaga, envParamsForInvitee} from './helpers'
import {
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
  DECRYPT_ENVS,
  DECRYPT_ENVS_SUCCESS,
  ACCEPT_INVITE,
  ACCEPT_INVITE_REQUEST,
  ACCEPT_INVITE_SUCCESS,
  ACCEPT_INVITE_FAILED,
  HASH_USER_PASSWORD,
  HASH_USER_PASSWORD_SUCCESS,
  GENERATE_USER_KEY,
  GENERATE_USER_KEY_SUCCESS,
  SELECT_ORG,
  GRANT_ENV_ACCESS,
  GRANT_ENV_ACCESS_REQUEST,
  GRANT_ENV_ACCESS_SUCCESS,
  GRANT_ENV_ACCESS_FAILED,
  login,
  selectOrg,
  decryptPrivkey,
  grantEnvAccessRequest
} from "actions"
import {
  getAuth,
  getOrgs,
  getApps,
  getServices,
  getPassword,
  getPrivkey,
  getEncryptedPrivkey,
  getIsDecryptingEnvs,
  getEnvsAreDecrypted,
  getInviteesNeedingAccess

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
  })

function *onLogin({payload}){
  yield put({type: HASH_USER_PASSWORD, payload})
  const {payload: {hashedPassword}} = yield take(HASH_USER_PASSWORD_SUCCESS)
  yield put({
    type: LOGIN_REQUEST,
    payload: {...payload, password: hashedPassword},
    meta: {rawPassword: payload.password}
  })
}

function *hashPasswordAndGenerateKeys(payload){
  yield [
    put({type: HASH_USER_PASSWORD, payload}),
    put({type: GENERATE_USER_KEY, payload})
  ]

  const [{payload: {hashedPassword}}, {payload: {pubkey, encryptedPrivkey}}] = yield [
    take(HASH_USER_PASSWORD_SUCCESS),
    take(GENERATE_USER_KEY_SUCCESS)
  ]

  return {hashedPassword, pubkey, encryptedPrivkey}
}

function *onAcceptInvite({payload}){
  const {hashedPassword, pubkey, encryptedPrivkey} = yield call(hashPasswordAndGenerateKeys, payload)

  yield put({
    type: ACCEPT_INVITE_REQUEST,
    payload: {...payload, password: hashedPassword, pubkey, encryptedPrivkey},
    meta: {rawPassword: payload.password}
  })
}

function *onRegister({payload}){
  const {hashedPassword, pubkey, encryptedPrivkey} = yield call(hashPasswordAndGenerateKeys, payload)

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
  const hashedPassword = crypto.hashedPassword(email, password)

  yield put({type: HASH_USER_PASSWORD_SUCCESS, payload: {email, hashedPassword}})
}

function *onGenerateUserKey({payload: {email, password}}){
  const {
    privateKeyArmored: encryptedPrivkey,
    publicKeyArmored: pubkey
  } = yield call(crypto.generateKeys, {
    id: crypto.emailHash(email),
    passphrase: password
  })

  yield put({type: GENERATE_USER_KEY_SUCCESS, payload: {encryptedPrivkey, pubkey}})
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
  const encryptedPrivkey = yield select(getEncryptedPrivkey),
        privkey = yield crypto.decryptPrivateKey({
          privkey: encryptedPrivkey, passphrase
        })

  yield put({type: DECRYPT_PRIVKEY_SUCCESS, payload: privkey})
}


function *onDecryptEnvs(action){
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
}

function *onDecryptEnvsSuccess(action){
  const invitees = yield select(getInviteesNeedingAccess)
  if(invitees && invitees.length){
    yield put({type: GRANT_ENV_ACCESS, payload: invitees})
  }
}

function *onDecrypt(action){
  const privkey = yield select(getPrivkey),
        encryptedPrivkey = yield select(getEncryptedPrivkey)

  if(privkey){
    yield put({type: DECRYPT_ENVS})
  } else if (encryptedPrivkey) {
    yield put({...action, type: DECRYPT_PRIVKEY})
  }
}

function *onFetchCurrentUserSuccess(action){
  const privkey = yield select(getPrivkey)
  if(privkey)yield call(dispatchDecryptEnvsIfNeeded)
}

function *dispatchDecryptEnvsIfNeeded(){
  const isDecryptingEnvs = yield select(getIsDecryptingEnvs),
        envsAreDecrypted = yield select(getEnvsAreDecrypted)

  if(!isDecryptingEnvs && !envsAreDecrypted){
    yield put({type: DECRYPT_ENVS})
  }
}

function *onGrantEnvAccess({payload: invitees}){
  for (let invitee of invitees){
    const envs = yield call(envParamsForInvitee, invitee)
    yield put(grantEnvAccessRequest({envs, orgUserId: invitee.orgUserId}))
  }
}

export default function* authSagas(){
  yield [
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
    takeLatest(GENERATE_USER_KEY, onGenerateUserKey),
    takeLatest(GRANT_ENV_ACCESS, onGrantEnvAccess),
    takeLatest(GRANT_ENV_ACCESS_REQUEST, onGrantEnvAccessRequest)
  ]

  while (true){
    yield [
      take(FETCH_CURRENT_USER_SUCCESS),
      take(DECRYPT_PRIVKEY_SUCCESS)
    ]

    yield call(dispatchDecryptEnvsIfNeeded)
  }

}

