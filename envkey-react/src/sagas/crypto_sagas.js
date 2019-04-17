import { takeLatest, takeEvery, put, select, call, take } from 'redux-saga/effects'
import R from 'ramda'
import {
  GENERATE_USER_KEYPAIR,
  GENERATE_USER_KEYPAIR_SUCCESS,
  DECRYPT_ALL,
  DECRYPT_ALL_SUCCESS,
  DECRYPT_ALL_FAILED,
  DECRYPT_ENVS,
  DECRYPT_ENVS_SUCCESS,
  DECRYPT_ENVS_FAILED,
  DECRYPT_PRIVKEY,
  DECRYPT_PRIVKEY_SUCCESS,
  DECRYPT_PRIVKEY_FAILED,
  VERIFY_ORG_PUBKEYS,
  VERIFY_ORG_PUBKEYS_SUCCESS,
  VERIFY_ORG_PUBKEYS_FAILED,
  UPDATE_TRUSTED_PUBKEYS,
  UPDATE_TRUSTED_PUBKEYS_REQUEST,
  UPDATE_TRUSTED_PUBKEYS_SUCCESS,
  UPDATE_TRUSTED_PUBKEYS_FAILED,
  VERIFY_TRUSTED_PUBKEYS,
  VERIFY_TRUSTED_PUBKEYS_SUCCESS,
  VERIFY_TRUSTED_PUBKEYS_FAILED,
  VERIFY_CURRENT_USER_PUBKEY,
  VERIFY_CURRENT_USER_PUBKEY_SUCCESS,
  VERIFY_CURRENT_USER_PUBKEY_FAILED,
  UPDATE_ENCRYPTED_PRIVKEY,
  UPDATE_ENCRYPTED_PRIVKEY_REQUEST,
  UPDATE_ENCRYPTED_PRIVKEY_SUCCESS,
  UPDATE_ENCRYPTED_PRIVKEY_FAILED,
  addTrustedPubkey,
  updateTrustedPubkeys,
  decryptPrivkey,
  logToSession,
  commitSanitizedActionLog
} from 'actions'
import {
  getPrivkey,
  getEncryptedPrivkey,
  getApp,
  getAppUser,
  getAllEnvParentsAreDecrypted,
  getEnvsAreDecrypted,
  getEnvsAreDecrypting,
  getIsDecryptingAll,
  getSignedTrustedPubkeys,
  getTrustedPubkeys,
  getCurrentUser,
  getAuth,
  getCurrentOrg,
  getUsersWithDeleted,
  getUsersById,
  getServers,
  getLocalKeys
} from 'selectors'
import {
  apiSaga,
  decryptEnvParent,
  decryptAllEnvParents,
  signTrustedPubkeys,
  keyableIsTrusted,
  checkPubkeyIsValid,
  verifyCurrentUser
} from './helpers'
import * as crypto from 'lib/crypto'
import {sanitizeError} from 'lib/log'

const
  onUpdateTrustedPubkeysRequest = apiSaga({
    authenticated: true,
    method: "post",
    actionTypes: [UPDATE_TRUSTED_PUBKEYS_SUCCESS, UPDATE_TRUSTED_PUBKEYS_FAILED],
    urlFn: action => "/users/update_trusted_pubkeys.json"
  }),

  onUpdateEncryptedPrivkeyRequest = apiSaga({
    authenticated: true,
    method: "put",
    actionTypes: [UPDATE_ENCRYPTED_PRIVKEY_SUCCESS, UPDATE_ENCRYPTED_PRIVKEY_FAILED],
    urlFn: action => "/users/update_encrypted_privkey.json"
  })

function *onVerifyOrgPubkeys(){
  const {id: orgId} = yield select(getCurrentOrg),
        auth = yield select(getAuth),
        trustedPubkeys = yield select(getTrustedPubkeys),
        users = yield select(getUsersWithDeleted),
        usersById = yield select(getUsersById),
        localKeys = yield select(getLocalKeys),
        servers = yield select(getServers),
        keyables = R.flatten([users, localKeys, servers]),
        newlyTrustedKeyables = {},
        unverifiedKeyables = {}

  let toLog = []
  const logKeyableProps = [
    "id",
    "name",
    "email",
    "firstName",
    "lastName",
    "pubkeyFingerprint",
    "invitePubkeyFingerprint",
    "role",
    "deleted",
    "active",
    "createdAt",
    "keyGeneratedById",
    "signedById",
    "keyGeneratedAt",
    "invitedById",
    "undeletable",
    "subEnvId"
   ]

  for (let keyables of [users, localKeys, servers]){
    for (let keyable of keyables){
      let {pubkey, invitePubkey, id: keyableId, invitedById: initialInvitedById} = keyable

      yield put(logToSession(
        "Checking keyable: ",
        R.pick(logKeyableProps, keyable)
      ))

      // keyGeneratedById for servers, userId (via appUserId) for localKeys
      let initialSignedById
      if (keyable.keyGeneratedById){
        initialSignedById = keyable.keyGeneratedById
      }

      yield put(logToSession("initialSignedById: ", initialSignedById, "initialInvitedById: ", initialInvitedById))

      // Only consider keyables with public keys generated
      if (!(pubkey || invitePubkey)){
        yield put(logToSession("No pubkey or invitePubkey, skipping..."))
        continue
      }

      // Continue if pubkey is already trusted
      // Mark unverified and continue if signedById not set for a non-owner (owner should already be trusted)
      let trusted = trustedPubkeys[keyableId],
          keyableTrusted = yield call(keyableIsTrusted, keyable)

      if(trusted && keyableTrusted){
        yield put(logToSession("Keyable ", keyableId, "is trusted, continuing..."))
        continue
      } else if (!(initialSignedById || initialInvitedById)){
        yield put(logToSession("Keyable ", keyableId, "has no initialSignedById or initialInvitedById--marking unverified..."))
        unverifiedKeyables[keyableId] = keyable
        continue
      }

      // Otherwise, attempt to verify signature chain back to a trusted key
      yield put(logToSession("Verifying to trusted root..."))

      let trustedRoot,
          signedById = initialSignedById,
          invitedById = initialInvitedById,
          checkingKeyable = keyable

      while (!trustedRoot){
        yield put(logToSession(
          "Starting loop.",
          "Checking keyable: ",
          R.pick(logKeyableProps, checkingKeyable),
          `signedById: ${signedById}, invitedById: ${invitedById}`,
        ))

        let signingId = invitedById || signedById
        if (!signingId){
          yield put(logToSession("No signing id... breaking"))
          break
        }

        // If signing user has already been marked unverified, break
        if (unverifiedKeyables[signingId]){
          yield put(logToSession("signing user marked unverified... breaking"))
          break
        }

        // Verify invite pubkey signature (for users) / pubkey signature (for other keyables)
        // If not verified or user not found, break
        let signingUser = usersById[signingId]

        yield put(logToSession(
          "signingUser: ",
          R.pick(logKeyableProps, signingUser)
        ))

        if(signingUser && signingUser.pubkey){
          let signedKey = invitedById ? checkingKeyable.invitePubkey : checkingKeyable.pubkey,
              verified

          yield put(logToSession("Verifying signed key."))
          try {
            verified = crypto.verifyPublicKeySignature({signedKey, signerKey: signingUser.pubkey})
          } catch (e) {
            yield put(logToSession("Verification error: ", sanitizeError(e)))
          }

          if(!verified){
            yield put(logToSession("Signature invalid, breaking..."))
            break
          }

        } else {
          yield put(logToSession("Signing user null or has no pubkey, breaking..."))
          break
        }

        // If user and user has accepted invite / generated pubkey, further verify that pubkey was signed by invite key
        if (checkingKeyable.invitePubkey && checkingKeyable.pubkey){
          yield put(logToSession("Verifying invite signature on user key."))
          let verified
          try {
            verified = crypto.verifyPublicKeySignature({signedKey: checkingKeyable.pubkey, signerKey: checkingKeyable.invitePubkey})
          } catch(e){
            yield put(logToSession("Verification error: ", sanitizeError(e)))
          }
          if(!verified){
            yield put(logToSession("Invite signature on user key invalid... breaking"))
            break
          }
        }

        // Check if signing user is trusted
        if (newlyTrustedKeyables[signingId]){
        // if already verified signing user in earlier pass, set trusted root
          yield put(logToSession("Signing id already verified... set trustedRoot"))
          trustedRoot = newlyTrustedKeyables[signingId]
        } else {
        // otherwise try to look up in trusted pubkeys
          yield put(logToSession("Signing id not yet verified... looking in trustedPubkeys"))
          trustedRoot = yield call(keyableIsTrusted, signingUser) ? trustedPubkeys[signingId] : null
        }

        yield put(logToSession("trustedRoot: ", R.pick(logKeyableProps, trustedRoot)))

        // If signer isn't trusted, continue checking chain
        if (!trustedRoot){
          yield put(logToSession("Signer not trusted, continue chain..."))
          invitedById = signingUser.invitedById
          signedById = null
          checkingKeyable = signingUser
        }
      }

      yield put(logToSession("Loop complete."))

      // If a trusted root was found, mark key trusted
      // Else, mark unverified
      if (trustedRoot){
        yield put(logToSession("trustedRoot found: ", R.pick(logKeyableProps, trustedRoot)))
        newlyTrustedKeyables[keyableId] = keyable
      } else {
        yield put(logToSession("no trustedRoot found."))
        unverifiedKeyables[keyableId] = keyable
      }
    }
  }

  if (R.isEmpty(unverifiedKeyables)){
    yield put(logToSession(
      "No unverifiedKeyables... success!",
      "newlyTrustedKeyables:",
      R.map(R.pick(logKeyableProps), newlyTrustedKeyables)
    ))
    if (!R.isEmpty(newlyTrustedKeyables)){
      for (let kid in newlyTrustedKeyables){
        let keyable = newlyTrustedKeyables[kid]
        yield put(addTrustedPubkey({keyable, orgId}))
      }

      if (auth["access-token"]){
        yield put(updateTrustedPubkeys())
      }
    }

    yield put({type: VERIFY_ORG_PUBKEYS_SUCCESS, payload: R.values(newlyTrustedKeyables)})
  } else {
    yield put(logToSession(
      "Has unverifiedKeyables... failure :(",
      R.map(R.pick(logKeyableProps), unverifiedKeyables)
    ))

    yield put({type: VERIFY_ORG_PUBKEYS_FAILED, error: true, payload: R.values(unverifiedKeyables)})
  }
}

function *onUpdateTrustedPubkeys({meta}){
  const signedTrustedPubkeys = yield call(signTrustedPubkeys),
        payload = {signedTrustedPubkeys}

  yield put({type: UPDATE_TRUSTED_PUBKEYS_REQUEST, payload, meta})
}

function *onUpdateEncryptedPrivkey({payload: {oldPassword, newPassword}}){

  yield put(decryptPrivkey({password: oldPassword}))

  const res = yield take([DECRYPT_PRIVKEY_SUCCESS, DECRYPT_PRIVKEY_FAILED])

  if (res.type == DECRYPT_PRIVKEY_FAILED){
    yield put({type: UPDATE_ENCRYPTED_PRIVKEY_FAILED, error: true, payload: "Invalid passphrase"})
  } else {

    const privkey = yield select(getPrivkey),

          encryptedPrivkey = crypto.encryptPrivateKey({privkey, passphrase: newPassword})


    yield put({type: UPDATE_ENCRYPTED_PRIVKEY_REQUEST, payload: {encryptedPrivkey}})
  }
}

function *onVerifyCurrentUserPubkey(){
  const
    {pubkey} = yield select(getCurrentUser),

    privkey = yield select(getPrivkey),

    valid = yield call(checkPubkeyIsValid, {pubkey, privkey})

  yield put({type: valid ? VERIFY_CURRENT_USER_PUBKEY_SUCCESS : VERIFY_CURRENT_USER_PUBKEY_FAILED})
}

function *onVerifyTrustedPubkeys(){
  let trustedPubkeys = yield select(getTrustedPubkeys)

  const signedTrustedPubkeys = yield select(getSignedTrustedPubkeys),
        {pubkey, role} = yield select(getCurrentUser)

  if (trustedPubkeys && !R.isEmpty(trustedPubkeys)){
    yield put({type: VERIFY_TRUSTED_PUBKEYS_SUCCESS, payload: trustedPubkeys})
  }else if(!signedTrustedPubkeys){
    yield put({type: VERIFY_TRUSTED_PUBKEYS_FAILED, error: true, payload: "No trusted pubkeys"})
  } else {
    try {
      trustedPubkeys = yield crypto.verifyCleartextJson({
        pubkey,
        signed: signedTrustedPubkeys
      })
      yield put({type: VERIFY_TRUSTED_PUBKEYS_SUCCESS, payload: trustedPubkeys})
    } catch (err){
      yield put({type: VERIFY_TRUSTED_PUBKEYS_FAILED, error: true, payload: err})
    }
  }
}

function *onGenerateUserKeypair({payload: {email, password}}){
  const
    {
      privateKeyArmored: encryptedPrivkey,
      publicKeyArmored: pubkey
    } = yield crypto.generateKeys({
      email,
      passphrase: password
    })

  yield put({type: GENERATE_USER_KEYPAIR_SUCCESS, payload: {encryptedPrivkey, pubkey}})
}

function *onDecryptPrivkey({payload: {password}}){
  const encryptedPrivkey = yield select(getEncryptedPrivkey)

  try {
    const privkey = yield crypto.decryptPrivateKey({
      privkey: encryptedPrivkey, passphrase: password
    })

    yield put({type: DECRYPT_PRIVKEY_SUCCESS, payload: privkey})
  } catch (err){
    yield put({type: DECRYPT_PRIVKEY_FAILED, error: true, payload: err})
  }
}


function *onDecryptAll(action){
  let privkey = yield select(getPrivkey)

  const encryptedPrivkey = yield select(getEncryptedPrivkey),
        background = R.path(["meta", "background"], action)

  if(!privkey && encryptedPrivkey){
    yield put({...action, type: DECRYPT_PRIVKEY})
    const res = yield take([DECRYPT_PRIVKEY_SUCCESS, DECRYPT_PRIVKEY_FAILED])
    if (!res.error){
      privkey = yield select(getPrivkey)
    } else {
      yield put({type: DECRYPT_ALL_FAILED, error: true, payload: res.payload})
    }
  }

  if(privkey){
    let verifyRes
    const skipVerify = R.path(["meta", "skipVerifyCurrentUser"], action)
    if (!skipVerify) verifyRes = yield call(verifyCurrentUser, background)

    if((skipVerify && !verifyRes) || !verifyRes.error){
      const hasEnvParents = yield call(decryptAllEnvParents, background)

      if (!hasEnvParents){
        yield put({type: DECRYPT_ALL_SUCCESS})
      }
    }

    if (verifyRes && verifyRes.error){
      yield put({type: DECRYPT_ALL_FAILED, error: true, payload: verifyRes.payload})
    }
  }
}

function *onDecryptEnvs(action){
  const {meta: {objectType, targetId, decryptAllAction, background}} = action,
        parent = yield select(getApp(targetId)),
        envsAreDecrypted = yield select(getEnvsAreDecrypted(parent.id))

  if(!(!background && decryptAllAction && envsAreDecrypted)){
    try {
      const decryptedParent = yield call(decryptEnvParent, parent)
      yield put({type: DECRYPT_ENVS_SUCCESS, payload: decryptedParent, meta: action.meta})
    } catch (err){
      yield put({type: DECRYPT_ENVS_FAILED, error: true, payload: err, meta: action.meta})
      yield put({type: DECRYPT_ALL_FAILED, error: true, payload: err})
    }
  }
}

function *onDecryptEnvsSuccess(action){
  const isDecryptingAll = yield select(getIsDecryptingAll)
  if(isDecryptingAll){
    const allEnvParentsAreDecrypted = yield select(getAllEnvParentsAreDecrypted)
    if (allEnvParentsAreDecrypted){
      yield put({type: DECRYPT_ALL_SUCCESS})
      yield put(commitSanitizedActionLog())
    }
  }
}

export default function* cryptoSagas(){
  yield [
    takeLatest(GENERATE_USER_KEYPAIR, onGenerateUserKeypair),
    takeLatest(DECRYPT_PRIVKEY, onDecryptPrivkey),
    takeLatest(DECRYPT_ALL, onDecryptAll),

    takeLatest(VERIFY_ORG_PUBKEYS, onVerifyOrgPubkeys),

    takeLatest(VERIFY_CURRENT_USER_PUBKEY, onVerifyCurrentUserPubkey),
    takeLatest(VERIFY_TRUSTED_PUBKEYS, onVerifyTrustedPubkeys),

    takeLatest(UPDATE_TRUSTED_PUBKEYS, onUpdateTrustedPubkeys),
    takeLatest(UPDATE_TRUSTED_PUBKEYS_REQUEST, onUpdateTrustedPubkeysRequest),

    takeLatest(UPDATE_ENCRYPTED_PRIVKEY, onUpdateEncryptedPrivkey),
    takeLatest(UPDATE_ENCRYPTED_PRIVKEY_REQUEST, onUpdateEncryptedPrivkeyRequest),

    takeEvery(DECRYPT_ENVS, onDecryptEnvs),
    takeEvery(DECRYPT_ENVS_SUCCESS, onDecryptEnvsSuccess)
  ]
}
