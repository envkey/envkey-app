import { put, select, call, take } from 'redux-saga/effects'
import R from 'ramda'
import * as crypto from 'lib/crypto'
import {keyableIsTrusted} from 'lib/trust'
import { delay } from 'redux-saga'
import {
  VERIFY_TRUSTED_PUBKEYS_SUCCESS,
  VERIFY_TRUSTED_PUBKEYS_FAILED,
  VERIFY_ORG_PUBKEYS_SUCCESS,
  VERIFY_ORG_PUBKEYS_FAILED,
  VERIFY_CURRENT_USER_PUBKEY_SUCCESS,
  VERIFY_CURRENT_USER_PUBKEY_FAILED,
  DECRYPT_PRIVKEY,
  DECRYPT_PRIVKEY_SUCCESS,
  DECRYPT_PRIVKEY_FAILED,
  UPDATE_TRUSTED_PUBKEYS_SUCCESS,
  UPDATE_TRUSTED_PUBKEYS_FAILED,
  decryptAll,
  decryptEnvs,
  verifyTrustedPubkeys,
  verifyCurrentUserPubkey,
  verifyOrgPubkeys,
  updateTrustedPubkeys,
  logToSession
} from 'actions'
import {
  getPrivkey,
  getApps,
  getEnvsAreDecrypted,
  getAllEnvParentsAreDecrypted,
  getSignedTrustedPubkeys,
  getTrustedPubkeys,
  getCurrentOrg,
  getCurrentUser,
  getUser,
  getTrustedPubkeyChain
} from "selectors"
import { normalizeEnvsWithMeta } from 'lib/env/transform'

export function* signTrustedPubkeys(signWithPrivkey=null){
  const privkey = signWithPrivkey || (yield select(getPrivkey)),
        {pubkey} = yield select(getCurrentUser),
        trustedPubkeys = yield select(getTrustedPubkeys);

  let signed;
  let numRetries = 0;
  while (!signed && numRetries < 10){
    signed = yield crypto.signCleartextJson({privkey, data: trustedPubkeys})

    try {
      yield crypto.verifyCleartextJson({
        pubkey,
        signed: signed
      })
      break;
    } catch (err){
      signed = null;
      numRetries++;
      yield call(delay, 10 * numRetries);
    }

  }

  if (!signed){
    alert("There was an error signing the trust chain. Please try again. If the problem persists, please email support@envkey.com")
    window.location.reload();
    throw new Error("Error signing trusted pubkeys.")
  }


  return signed
}

export function* signTrustedPubkeyChain(signWithPrivkey=null){
  const privkey = signWithPrivkey || (yield select(getPrivkey)),
        {pubkey} = yield select(getCurrentUser),
        trustedPubkeys = yield select(getTrustedPubkeyChain);


  let signed;
  let numRetries = 0;
  while (!signed && numRetries < 10){
    signed = yield crypto.signCleartextJson({privkey, data: trustedPubkeys})

    try {
      yield crypto.verifyCleartextJson({
        pubkey,
        signed: signed
      })
      break;
    } catch (err){
      signed = null;
      numRetries++;
      yield call(delay, 10 * numRetries);
    }

  }

  if (!signed){
    alert("There was an error signing the trust chain. Please try again. If the problem persists, please email support@envkey.com")
    window.location.reload();
    throw new Error("Error signing trusted pubkeys.")
  }


  return signed
}

export function* decryptEnvParent(parent){
  const privkey = yield select(getPrivkey),
        {id: orgId} = yield select(getCurrentOrg),
        trustedPubkeys = yield select(getTrustedPubkeys)

  if (parent.encryptedEnvsWithMeta){
    const decrypted = {}
    for (let environment in parent.encryptedEnvsWithMeta){
      let encrypted = parent.encryptedEnvsWithMeta[environment]

      if(!encrypted || R.isEmpty(encrypted)){
        decrypted[environment] = {}
      } else {
        let signedById = R.path(["envsSignedBy", environment], parent)

        if(!signedById) throw new Error(`Parent ${parent.id} ${environment} environment not signed.`)

        let signedByUser = yield select(getUser(signedById)),

            trusted = keyableIsTrusted(signedByUser, trustedPubkeys)

        if (!trusted) throw new Error(`Signing user ${signedById} not trusted.`)

        decrypted[environment] = yield crypto.decryptJson({encrypted, privkey, pubkey: signedByUser.pubkey})
      }
    }
    return R.pipe(
      R.assoc("envsWithMeta", normalizeEnvsWithMeta(decrypted)),
      R.dissoc("encryptedEnvsWithMeta")
    )(parent)
  } else {
    return parent
  }
}

export function* decryptAllEnvParents(background=false){
  const apps = yield select(getApps)
  let didDecrypt = false

  for (let {id: targetId, encryptedEnvsWithMeta} of apps){
    if (encryptedEnvsWithMeta){
      yield put(decryptEnvs({objectType: "app", targetId, background, decryptAllAction: true}))
      didDecrypt = true
    }
  }

  return didDecrypt
}

export function *verifyCurrentUser(background=false){
  const privkey = yield select(getPrivkey)
  if(!privkey) throw new Error("Privkey not decrypted.")

  const [verifyCurrentUserPubkeyRes, verifyTrustedPubkeysRes] = yield [
    call(execVerifyCurrentUserPubkey, background),
    call(execVerifyTrustedPubkeys)
  ]

  if(verifyCurrentUserPubkeyRes.error) return verifyCurrentUserPubkeyRes
  if(verifyTrustedPubkeysRes.error) return verifyTrustedPubkeysRes

  const verifyOrgPubkeysRes = yield call(execVerifyOrgPubkeys)
  return verifyOrgPubkeysRes
}

export function *dispatchDecryptAllIfNeeded(background=false){
  const privkey = yield select(getPrivkey)
  if(privkey) yield put(decryptAll({background}))
}

export function* decryptPrivkeyAndDecryptAllIfNeeded(password){
  const decryptPrivkeyResult = yield call(execDecryptPrivkey, password)
  if (!decryptPrivkeyResult.error) yield call(dispatchDecryptAllIfNeeded)
  return decryptPrivkeyResult
}

export function* checkPubkeyIsValid({pubkey, privkey}){
  try {
    const data = "Test message",
        encrypted = yield crypto.encryptJson({pubkey, data}),
        decrypted = yield crypto.decryptJson({privkey, encrypted})

    return decrypted === data
  } catch (e){
    return false
  }
}

export function* execVerifyCurrentUserPubkey(background=false){
  yield put(verifyCurrentUserPubkey({background}))
  const res = yield take([VERIFY_CURRENT_USER_PUBKEY_SUCCESS, VERIFY_CURRENT_USER_PUBKEY_FAILED])
  return res
}

export function* execDecryptPrivkey(password){
  yield put({type: DECRYPT_PRIVKEY, payload: {password}})
  const res = yield take([DECRYPT_PRIVKEY_SUCCESS, DECRYPT_PRIVKEY_FAILED])
  return res
}

export function* execVerifyTrustedPubkeys(){
  yield put(verifyTrustedPubkeys())
  const res = yield take([VERIFY_TRUSTED_PUBKEYS_SUCCESS, VERIFY_TRUSTED_PUBKEYS_FAILED])
  return res
}

export function* execVerifyOrgPubkeys(){
  yield put(verifyOrgPubkeys())
  const res = yield take([
    VERIFY_ORG_PUBKEYS_SUCCESS,
    VERIFY_ORG_PUBKEYS_FAILED
  ])
  return res
}

export function* execUpdateTrustedPubkeys(orgSlug){
  yield put(updateTrustedPubkeys({orgSlug}))
  const res = yield take([
    UPDATE_TRUSTED_PUBKEYS_SUCCESS,
    UPDATE_TRUSTED_PUBKEYS_FAILED
  ])
  return res
}
