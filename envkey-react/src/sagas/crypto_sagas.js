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
  addTrustedPubkey,
  updateTrustedPubkeys
} from 'actions'
import {
  getPrivkey,
  getEncryptedPrivkey,
  getApp,
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
  onUpdateTrustedPubkeysRequest = apiSaga({
    authenticated: true,
    method: "post",
    actionTypes: [UPDATE_TRUSTED_PUBKEYS_SUCCESS, UPDATE_TRUSTED_PUBKEYS_FAILED],
    urlFn: action => "/users/update_trusted_pubkeys.json"
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
        newlyTrustedPubkeys = [],
        unverifiedPubkeys = []

  for (let keyables of [users, localKeys, servers]){
    for (let keyable of keyables){
      let {pubkey, invitePubkey, id: keyableId, invitedById: initialInvitedById} = keyable

      // keyGeneratedById for servers, userId for localKeys
      const initialSignedById = keyable.keyGeneratedById || keyable.userId

      // Only consider keyables with public keys generated
      if (!(pubkey || invitePubkey)){
        continue
      }

      // Continue if pubkey is already trusted
      // Mark unverified and continue if signedById not set for a non-owner (owner should already be trusted)
      let trusted = trustedPubkeys[keyableId],
          keyableTrusted = yield call(keyableIsTrusted, keyable)

      if(trusted && keyableTrusted){
        continue
      } else if (!(initialSignedById || initialInvitedById)){
        unverifiedPubkeys.push(keyable)
        continue
      }


      // Otherwise, attempt to verify signature chain back to a trusted key
      let trustedRoot,
          signedById = initialSignedById,
          invitedById = initialInvitedById,
          checkedIds = {}

      while (!trustedRoot){
        let signingId = invitedById || signedById
        if (!signingId){
          break
        }

        // If already checked this user in the chain, break
        if (checkedIds[signedById]){
          break
        }

        // Verify invite pubkey signature (for users) / pubkey signature (for other keyables)
        // If not verified or user not found, break
        let signingUser = usersById[signingId]

        if(signingUser && signingUser.pubkey){
          let signedKey = invitedById ? invitePubkey : pubkey,
              verified

          try {
            verified = yield crypto.verifyPublicKeySignature({signedKey, signerKey: signingUser.pubkey})
          } catch (e) {}

          if(!verified){
            break
          }

        } else {
          break
        }

        // If user and user has accepted invite / generated pubkey, further verify that pubkey was signed by invite key
        if (invitePubkey && pubkey){
          let verified
          try {
            verified = yield crypto.verifyPublicKeySignature({signedKey: pubkey, signerKey: invitePubkey})
          } catch(e){}
          if(!verified){
            break
          }
        }

        // Check if signing user is trusted
        trustedRoot = yield call(keyableIsTrusted, signingId) ? trustedPubkeys[signingId] : null

        // Mark id checked
        checkedIds[signingId] = true

        // If signer isn't trusted, continue checking chain
        if (!trustedRoot){
          invitedById = signedByUser.invitedById
          signedById = null
        }
      }

      // If a trusted root was found, mark key trusted
      // Else, mark unverified
      if (trustedRoot){
        newlyTrustedPubkeys.push(keyable)
      } else {
        unverifiedPubkeys.push(keyable)
      }
    }
  }

  if (unverifiedPubkeys.length){
    yield put({type: VERIFY_ORG_PUBKEYS_FAILED, error: true, payload: unverifiedPubkeys})
  } else {
    if (newlyTrustedPubkeys.length){
      for (let keyable of newlyTrustedPubkeys){
        yield put(addTrustedPubkey({keyable, orgId}))
      }

      if (auth["access-token"]){
        yield put(updateTrustedPubkeys())
      }
    }

    yield put({type: VERIFY_ORG_PUBKEYS_SUCCESS, payload: newlyTrustedPubkeys})
  }
}

function *onUpdateTrustedPubkeys({meta}){
  const signedTrustedPubkeys = yield call(signTrustedPubkeys),
        payload = {signedTrustedPubkeys}

  yield put({type: UPDATE_TRUSTED_PUBKEYS_REQUEST, payload, meta})
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
        firstTarget = R.path(["meta", "firstTarget"], action)

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
    if (!skipVerify) verifyRes = yield call(verifyCurrentUser)

    let decryptErr
    if((skipVerify && !verifyRes) || !verifyRes.error){
      try {
        const hasEnvParents = yield call(decryptAllEnvParents, firstTarget)
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

    takeEvery(DECRYPT_ENVS, onDecryptEnvs),
    takeEvery(DECRYPT_ENVS_SUCCESS, onDecryptEnvsSuccess)
  ]
}
