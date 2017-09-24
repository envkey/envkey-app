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
  decryptPrivkey
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
  getUsers,
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

const
  devMode = process.env.NODE_ENV == "development" || process.env.BUILD_ENV == "staging",

  doLogging = devMode,

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
        users = yield select(getUsers),
        usersById = yield select(getUsersById),
        localKeys = yield select(getLocalKeys),
        servers = yield select(getServers),
        keyables = R.flatten([users, localKeys, servers]),
        newlyTrustedKeyables = {},
        unverifiedKeyables = {}

  for (let keyables of [users, localKeys, servers]){
    for (let keyable of keyables){
      let {pubkey, invitePubkey, id: keyableId, invitedById: initialInvitedById} = keyable

      if(doLogging)console.log("Checking keyable id: ", keyableId, " email: ", keyable.email, " name: ", keyable.name)
      if(doLogging)console.log(keyable)

      // keyGeneratedById for servers, userId (via appUserId) for localKeys
      let initialSignedById
      if (keyable.keyGeneratedById){
        initialSignedById = keyable.keyGeneratedById
      }

      if(doLogging)console.log("initialSignedById: ", initialSignedById)
      if(doLogging)console.log("initialInvitedById: ", initialInvitedById)

      // Only consider keyables with public keys generated
      if (!(pubkey || invitePubkey)){
        if(doLogging)console.log("No pubkey or invitePubkey, skipping...")
        continue
      }

      // Continue if pubkey is already trusted
      // Mark unverified and continue if signedById not set for a non-owner (owner should already be trusted)
      let trusted = trustedPubkeys[keyableId],
          keyableTrusted = yield call(keyableIsTrusted, keyable)

      if(trusted && keyableTrusted){
        if(doLogging)console.log("Keyable ", keyableId, "is trusted, continuing...")
        continue
      } else if (!(initialSignedById || initialInvitedById)){
        if(doLogging)console.log("Keyable ", keyableId, "has no initialSignedById or initialInvitedById--marking unverified...")
        unverifiedKeyables[keyableId] = keyable
        continue
      }

      // Otherwise, attempt to verify signature chain back to a trusted key
      if(doLogging)console.log("Verifying to trusted root...")

      let trustedRoot,
          signedById = initialSignedById,
          invitedById = initialInvitedById,
          checkingKeyable = keyable

      while (!trustedRoot){
        if(doLogging)console.log("Starting loop.")
        if(doLogging)console.log("Checking keyable: ", checkingKeyable)
        if(doLogging)console.log("signedById: ", signedById, ", invitedById: ", invitedById)

        let signingId = invitedById || signedById
        if (!signingId){
          if(doLogging)console.log("No signing id... breaking")
          break
        }

        // If signing user has already been marked unverified, break
        if (unverifiedKeyables[signingId]){
          if(doLogging)console.log("signing user marked unverified... breaing")
          break
        }

        // Verify invite pubkey signature (for users) / pubkey signature (for other keyables)
        // If not verified or user not found, break
        let signingUser = usersById[signingId]

        if(doLogging)console.log("signingUser: ", signingUser)

        if(signingUser && signingUser.pubkey){
          let signedKey = invitedById ? checkingKeyable.invitePubkey : checkingKeyable.pubkey,
              verified

          if(doLogging)console.log("Verifying signed key.")
          try {
            verified = crypto.verifyPublicKeySignature({signedKey, signerKey: signingUser.pubkey})
            console.log("verified: ", verified)
          } catch (e) {
            console.log("Verification error: ", e)
          }

          if(!verified){
            if(doLogging)console.log("Signature invalid, breaking...")
            break
          }

        } else {
          if(doLogging)console.log("Signing user null or has no pubkey, breaking...")
          break
        }

        // If user and user has accepted invite / generated pubkey, further verify that pubkey was signed by invite key
        if (checkingKeyable.invitePubkey && checkingKeyable.pubkey){
          if(doLogging)console.log("Verifying invite signature on user key.")
          let verified
          try {
            verified = crypto.verifyPublicKeySignature({signedKey: checkingKeyable.pubkey, signerKey: checkingKeyable.invitePubkey})
          } catch(e){
            console.log("Verification error: ", e)
          }
          if(!verified){
            if(doLogging)console.log("Invite signature on user key invalid... breaking")
            break
          }
        }

        // Check if signing user is trusted
        if (newlyTrustedKeyables[signingId]){
        // if already verified signing user in earlier pass, set trusted root
          if(doLogging)console.log("Signing id already verified... set trustedRoot")
          trustedRoot = newlyTrustedKeyables[signingId]
        } else {
        // otherwise try to look up in trusted pubkeys
          if(doLogging)console.log("Signing id not yet verified... looking in trustedPubkeys")
          trustedRoot = yield call(keyableIsTrusted, signingUser) ? trustedPubkeys[signingId] : null
        }

        if(doLogging)console.log("trustedRoot: ", trustedRoot)

        // If signer isn't trusted, continue checking chain
        if (!trustedRoot){
          if(doLogging)console.log("Signer not trusted, continue chain...")
          invitedById = signingUser.invitedById
          signedById = null
          checkingKeyable = signingUser
        }
      }

      if(doLogging)console.log("Loop complete.")

      // If a trusted root was found, mark key trusted
      // Else, mark unverified
      if (trustedRoot){
        if(doLogging)console.log("trustedRoot found: ", trustedRoot)
        newlyTrustedKeyables[keyableId] = keyable
      } else {
        if(doLogging)console.log("no trustedRoot found.")
        unverifiedKeyables[keyableId] = keyable
      }
    }
  }

  if (R.isEmpty(unverifiedKeyables)){
    if(doLogging)console.log("No unverifiedKeyables... success!")
      if(doLogging)console.log("newlyTrustedKeyables:")
    if(doLogging)console.log(newlyTrustedKeyables)
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
    if(doLogging)console.log("Has unverifiedKeyables... failure :(")
    if(doLogging)console.log(unverifiedKeyables)

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
        firstTarget = R.path(["meta", "firstTarget"], action),
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

    let decryptErr
    if((skipVerify && !verifyRes) || !verifyRes.error){
      try {
        const hasEnvParents = yield call(decryptAllEnvParents, firstTarget, background)
        if (!hasEnvParents){
          yield put({type: DECRYPT_ALL_SUCCESS})
        }
      } catch (err){
        decryptErr = err
      }
    }

    if ((verifyRes && verifyRes.error) || decryptErr){
      yield put({type: DECRYPT_ALL_FAILED, error: true, payload: (verifyRes ? verifyRes.payload : decryptErr)})
    }
  }
}

function *onDecryptEnvs(action){
  const {meta: {objectType, targetId, decryptAllAction}} = action,
        parent = yield select(getApp(targetId)),
        envsAreDecrypted = yield select(getEnvsAreDecrypted(parent.id))

  if(!(decryptAllAction && envsAreDecrypted)){
    try {
      const decryptedParent = yield call(decryptEnvParent, parent)
      yield put({type: DECRYPT_ENVS_SUCCESS, payload: decryptedParent, meta: action.meta})
    } catch (err){
      yield put({type: DECRYPT_ENVS_FAILED, error: true, payload: err, meta: action.meta})
      throw(err)
    }
  }
}

function *onDecryptEnvsSuccess(action){
  const isDecryptingAll = yield select(getIsDecryptingAll)
  if(isDecryptingAll){
    const allEnvParentsAreDecrypted = yield select(getAllEnvParentsAreDecrypted)
    if (allEnvParentsAreDecrypted){
      yield put({type: DECRYPT_ALL_SUCCESS})
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
