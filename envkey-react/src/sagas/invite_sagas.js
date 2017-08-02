import R from 'ramda'
import { takeLatest, takeEvery, put, select, call, take } from 'redux-saga/effects'
import {delay} from 'redux-saga'
import {
  apiSaga,
  getIdentityHash,
  execDecryptPrivkey,
  execVerifyTrustedPubkeys,
  execVerifyOrgPubkeys,
  envParamsForAcceptedInvite,
  signTrustedPubkeys,
  checkInviteePubkeyIsValid,
  envParamsForInvitee
} from './helpers'
import {
  getInviteParams,
  getInviteIdentityHash,
  getInvitePassphrase,
  getPrivkey,
  getCurrentOrg,
  getCurrentUser,
  getInviteeEncryptedPrivkey
} from 'selectors'
import {
  decryptPrivateKey,
  signPublicKey,
  getPubkeyFingerprint,
  secureRandomAlphanumeric,
  generateKeys
} from 'lib/crypto'
import {
  GENERATE_INVITE_LINK,
  GENERATE_INVITE_LINK_SUCCESS,
  GENERATE_INVITE_LINK_FAILED,

  LOAD_INVITE,
  LOAD_INVITE_REQUEST,
  LOAD_INVITE_SUCCESS,
  LOAD_INVITE_FAILED,

  VERIFY_INVITE_PARAMS,
  VERIFY_INVITE_PARAMS_SUCCESS,
  VERIFY_INVITE_PARAMS_FAILED,

  VERIFY_INVITE_EMAIL_REQUEST,
  VERIFY_INVITE_EMAIL_API_SUCCESS,
  VERIFY_INVITE_EMAIL_SUCCESS,
  VERIFY_INVITE_EMAIL_FAILED,

  ACCEPT_INVITE,
  ACCEPT_INVITE_REQUEST,
  ACCEPT_INVITE_SUCCESS,
  ACCEPT_INVITE_FAILED,

  DECRYPT_ALL,
  DECRYPT_ALL_SUCCESS,
  DECRYPT_ALL_FAILED,

  HASH_USER_PASSWORD,
  HASH_USER_PASSWORD_SUCCESS,

  HASH_PASSWORD_AND_GENERATE_KEYS,
  HASH_PASSWORD_AND_GENERATE_KEYS_SUCCESS,

  GRANT_ENV_ACCESS,
  GRANT_ENV_ACCESS_REQUEST,
  GRANT_ENV_ACCESS_FAILED,
  GRANT_ENV_ACCESS_SUCCESS,

  LOGIN_REQUEST,

  verifyInviteParams,
  acceptInviteRequest,
  loadInviteRequest,
  addTrustedPubkey,
  grantEnvAccessRequest
} from 'actions'

const
  onLoadInviteRequest = apiSaga({
    authenticated: false,
    skipOrg: true,
    method: "get",
    actionTypes: [LOAD_INVITE_SUCCESS, LOAD_INVITE_FAILED],
    urlFn: ({meta: {identityHash}}) => `/invite_links/${identityHash}.json`
  }),

  onVerifyInviteEmailRequest = apiSaga({
    authenticated: false,
    skipOrg: true,
    method: "post",
    actionTypes: [VERIFY_INVITE_EMAIL_API_SUCCESS, VERIFY_INVITE_EMAIL_FAILED],
    urlFn: ({meta: {identityHash}}) => `/invite_links/${identityHash}/verify_email.json`
  }),

  onAcceptInviteRequest = apiSaga({
    authenticated: false,
    skipOrg: true,
    method: "post",
    actionTypes: [ACCEPT_INVITE_SUCCESS, ACCEPT_INVITE_FAILED],
    urlFn: ({meta: {identityHash}}) => `/invite_links/${identityHash}/accept_invite.json`
  }),

  onGrantEnvAccessRequest = apiSaga({
    authenticated: true,
    method: "patch",
    actionTypes: [GRANT_ENV_ACCESS_SUCCESS, GRANT_ENV_ACCESS_FAILED],
    urlFn: (action)=> `/org_users/${action.meta.orgUserId}/grant_env_access.json`
  })

function* onLoadInvite({payload: {identityHash, passphrase}}){
  yield put(loadInviteRequest({identityHash}))
}

function* onLoadInviteSuccess({meta: {identityHash}, payload}){
  yield put(verifyInviteParams({identityHash}))
}

function* onVerifyInviteParams({meta, payload: { identityHash }}){
  const inviteParams = yield select(getInviteParams),
        serverIdentityHash = getIdentityHash(inviteParams),
        isValid = serverIdentityHash === identityHash

  yield put({type: (isValid ? VERIFY_INVITE_PARAMS_SUCCESS : VERIFY_INVITE_PARAMS_FAILED)})
}

function* onVerifyInviteEmailApiSuccess({meta}){
  let err
  const invitePassphrase = yield select(getInvitePassphrase),
        decryptPrivkeyResult = yield call(execDecryptPrivkey, invitePassphrase)

  if (!decryptPrivkeyResult.error){
    const pubkeyValid = yield call(checkInviteePubkeyIsValid)

    if (pubkeyValid){
      const verifyTrustedPubkeysResult = yield call(execVerifyTrustedPubkeys)
      if (!verifyTrustedPubkeysResult.error){
        const verifyOrgPubkeysResult = yield call(execVerifyOrgPubkeys)
        if (!verifyOrgPubkeysResult.error){
          yield put({type: DECRYPT_ALL, meta: {skipVerifyCurrentUser: true}})
          const decryptAllRes = yield take([DECRYPT_ALL_SUCCESS, DECRYPT_ALL_FAILED])
          if (decryptAllRes.error) err = decryptAllRes.payload
        } else {
          err = verifyOrgPubkeysResult.payload
        }
      } else {
        err = verifyTrustedPubkeysResult.error
      }
    } else {
      err = "Pubkey invalid."
    }
  } else {
    err = decryptPrivkeyResult.payload
  }

  if (err){
    yield put({type: VERIFY_INVITE_EMAIL_FAILED, error: true, payload: err})
  } else {
    yield put({type: VERIFY_INVITE_EMAIL_SUCCESS, meta})
  }
}

function* onGenerateInviteLink(action){
  try {
    const
      {meta, payload} = action,

      currentOrg = yield select(getCurrentOrg),

      currentUser = yield select(getCurrentUser),

      passphrase = secureRandomAlphanumeric(16),

      {
        privateKeyArmored: encryptedPrivkey,
        publicKeyArmored: pubkey
      } = yield generateKeys({
        email: [currentOrg.slug, "invite-link", payload.user.email].join("-"),
        passphrase
      }),

      decryptedPrivkey = yield decryptPrivateKey({
        privkey: encryptedPrivkey, passphrase
      }),

      currentUserPrivkey = yield select(getPrivkey),

      signedPubkey = yield signPublicKey({pubkey, privkey: currentUserPrivkey}),

      pubkeyFingerprint = getPubkeyFingerprint(signedPubkey),

      signedTrustedPubkeys = yield call(signTrustedPubkeys, decryptedPrivkey),

      identityHash = getIdentityHash({
        pubkeyFingerprint,
        invitedBy: currentUser,
        invitee: payload.user,
        org: currentOrg
      })

    yield put({
      type: GENERATE_INVITE_LINK_SUCCESS,
      meta: {...meta, passphrase, identityHash, user: payload.user},
      payload: {
        identityHash,
        encryptedPrivkey,
        pubkeyFingerprint,
        signedTrustedPubkeys,
        pubkey: signedPubkey
      }
    })
  } catch (e) {
    yield put({
      type: GENERATE_INVITE_LINK_FAILED,
      meta: action.meta,
      error: true,
      payload: e
    })
  }
}

function *onAcceptInvite({payload}){
  document.body.className += " preloader-authenticate"
  const overlay = document.getElementById("preloader-overlay")
  overlay.className = overlay.className.replace("hide", "")
  document.body.className += " no-scroll"
  yield call(delay, 50)

  const {password: rawPassword} = payload,
        identityHash = yield select(getInviteIdentityHash),
        invitePassphrase = yield select(getInvitePassphrase),
        inviteParams = yield select(getInviteParams),
        {id: orgId, slug: orgSlug} = yield select(getCurrentOrg),
        currentUser = yield select(getCurrentUser),
        hashPayload = {password: rawPassword, email: inviteParams.invitee.email}

  let pubkey, encryptedPrivkey, hashedPassword

  if (inviteParams.invitee.pubkey){
    // Existing user being added to org
    pubkey = inviteParams.invitee.pubkey
    encryptedPrivkey = yield select(getInviteeEncryptedPrivkey)
    yield put({type: HASH_USER_PASSWORD, payload: hashPayload})
    const res = yield take(HASH_USER_PASSWORD_SUCCESS)
    hashedPassword = res.payload.hashedPassword
  } else {
    // New user
    yield put({type: HASH_PASSWORD_AND_GENERATE_KEYS, payload: hashPayload})
    const res = yield take(HASH_PASSWORD_AND_GENERATE_KEYS_SUCCESS)
    pubkey = res.payload.pubkey
    encryptedPrivkey = res.payload.encryptedPrivkey
    hashedPassword = res.payload.hashedPassword
  }

  const
    pubkeyFingerprint = getPubkeyFingerprint(pubkey),
    user = {
      pubkey,
      encryptedPrivkey,
      pubkeyFingerprint,
      password: hashedPassword
    },
    invitePrivkey = yield select(getPrivkey),
    decryptedPrivkey = yield decryptPrivateKey({privkey: encryptedPrivkey, passphrase: rawPassword})

  const signedPubkey = yield signPublicKey({pubkey, privkey: invitePrivkey})

  yield put(addTrustedPubkey({
    orgId,
    keyable: {
      type: "user",
      ...currentUser,
      invitePubkey: inviteParams.pubkey,
      invitePubkeyFingerprint: inviteParams.invitePubkeyFingerprint,
      pubkey: signedPubkey,
      pubkeyFingerprint
    }
  }))

  const signedTrustedPubkeys = yield call(signTrustedPubkeys, decryptedPrivkey)

  yield put(acceptInviteRequest({
    rawPassword,
    hashedPassword,
    identityHash,
    user,
    orgSlug,
    email: inviteParams.invitee.email,
    orgUser: { signedTrustedPubkeys, pubkey: signedPubkey },
    envs: yield call(envParamsForAcceptedInvite, signedPubkey)
  }))
}

function *onAcceptInviteSuccess({meta: {rawPassword, hashedPassword, email, orgSlug}}){
  yield put({type: LOGIN_REQUEST, payload: {email, password: hashedPassword}, meta: {rawPassword, orgSlug}})
}

function *onGrantEnvAccess({payload: invitees, meta}){
  for (let invitee of invitees){

    let inviteeEnvParams = yield call(envParamsForInvitee, invitee)

    yield put(grantEnvAccessRequest({
      ...inviteeEnvParams,
      ...meta,
      ...R.pick(["orgUserId", "userId"], invitee)
    }))
  }
}

export default function* inviteSagas(){
  yield [
    takeLatest(LOAD_INVITE, onLoadInvite),
    takeLatest(LOAD_INVITE_REQUEST, onLoadInviteRequest),
    takeLatest(LOAD_INVITE_SUCCESS, onLoadInviteSuccess),
    takeLatest(VERIFY_INVITE_PARAMS, onVerifyInviteParams),
    takeLatest(VERIFY_INVITE_EMAIL_REQUEST, onVerifyInviteEmailRequest),
    takeLatest(VERIFY_INVITE_EMAIL_API_SUCCESS, onVerifyInviteEmailApiSuccess),
    takeLatest(ACCEPT_INVITE, onAcceptInvite),
    takeLatest(ACCEPT_INVITE_REQUEST, onAcceptInviteRequest),
    takeLatest(ACCEPT_INVITE_SUCCESS, onAcceptInviteSuccess),
    takeEvery(GENERATE_INVITE_LINK, onGenerateInviteLink),
    takeEvery(GRANT_ENV_ACCESS, onGrantEnvAccess),
    takeEvery(GRANT_ENV_ACCESS_REQUEST, onGrantEnvAccessRequest)
  ]
}
