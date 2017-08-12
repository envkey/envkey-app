import { put, select, call, take } from 'redux-saga/effects'
import R from 'ramda'
import * as crypto from 'lib/crypto'
import {
  DECRYPT_ALL,
  VERIFY_TRUSTED_PUBKEYS_SUCCESS,
  VERIFY_TRUSTED_PUBKEYS_FAILED,
  VERIFY_ORG_PUBKEYS_SUCCESS,
  VERIFY_ORG_PUBKEYS_FAILED,
  VERIFY_CURRENT_USER_PUBKEY,
  VERIFY_CURRENT_USER_PUBKEY_SUCCESS,
  VERIFY_CURRENT_USER_PUBKEY_FAILED,
  DECRYPT_PRIVKEY,
  DECRYPT_PRIVKEY_SUCCESS,
  DECRYPT_PRIVKEY_FAILED,
  UPDATE_TRUSTED_PUBKEYS_SUCCESS,
  UPDATE_TRUSTED_PUBKEYS_FAILED,
  decryptEnvs,
  verifyTrustedPubkeys,
  verifyCurrentUserPubkey,
  verifyOrgPubkeys,
  updateTrustedPubkeys
} from 'actions'
import {
  getPrivkey,
  getApps,
  getEnvsAreDecrypted,
  getAllEnvParentsAreDecrypted,
  getSignedTrustedPubkeys,
  getTrustedPubkeys,
  getTrustedPubkey,
  getCurrentOrg,
  getCurrentUser,
  getUser
} from "selectors"
import { normalizeEnvsWithMeta } from 'lib/env/transform'
import { TRUSTED_PUBKEY_PROPS } from 'constants'

export function* signTrustedPubkeys(signWithPrivkey=null){
  const privkey = signWithPrivkey || (yield select(getPrivkey)),
        trustedPubkeys = yield select(getTrustedPubkeys),
        signed = yield crypto.signCleartextJson({
          privkey,
          data: trustedPubkeys
        })

  return signed
}

export function* keyableIsTrusted(keyable){
  const {id: keyableId} = keyable,
        {id: orgId} = yield select(getCurrentOrg),
        trustedPubkeys = yield select(getTrustedPubkeys),
        trusted = R.prop(keyableId, trustedPubkeys)

  return Boolean(trusted) && R.equals(R.pick(TRUSTED_PUBKEY_PROPS, keyable), R.pick(TRUSTED_PUBKEY_PROPS, trusted))
}

export function* decryptEnvParent(parent){
  const privkey = yield select(getPrivkey),
        {id: orgId} = yield select(getCurrentOrg)

  if (parent.encryptedEnvsWithMeta){
    const decrypted = {}
    for (let environment in parent.encryptedEnvsWithMeta){
      let encrypted = parent.encryptedEnvsWithMeta[environment]

      if(!encrypted || R.isEmpty(encrypted)){
        decrypted[environment] = {}
      } else {
        let signedById = R.path(["envsSignedBy", environment], parent)

        if(!signedById) throw new Error(`Parent ${parent.id} ${environment} environment not signed.`)

        let trustedPubkey = signedById ? (yield select(getTrustedPubkey(signedById))) : null

        if (!trustedPubkey) throw new Error(`Trusted public key not found for user ${signedById}.`)

        decrypted[environment] = yield crypto.decryptJson({encrypted, privkey, pubkey: trustedPubkey})
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

export function* decryptAllEnvParents(firstTarget){
  const apps = yield select(getApps)

  if (apps.length === 0)return false

  if (firstTarget){
    yield put(decryptEnvs({...firstTarget, decryptAllAction: true}))
  }

  for (let {id: targetId} of apps){
    yield put(decryptEnvs({app, targetId, decryptAllAction: true}))
  }

  return true
}

export function *verifyCurrentUser(){
  const privkey = yield select(getPrivkey)
  if(!privkey) throw new Error("Privkey not decrypted.")

  const [verifyCurrentUserPubkeyRes, verifyTrustedPubkeysRes] = yield [
    call(execVerifyCurrentUserPubkey),
    call(execVerifyTrustedPubkeys)
  ]

  if(verifyCurrentUserPubkeyRes.error) return verifyCurrentUserPubkeyRes
  if(verifyTrustedPubkeysRes.error) return verifyTrustedPubkeysRes

  const verifyOrgPubkeysRes = yield call(execVerifyOrgPubkeys)
  return verifyOrgPubkeysRes
}

export function *dispatchDecryptAllIfNeeded(){
  const privkey = yield select(getPrivkey)
  if(privkey) yield put({type: DECRYPT_ALL})
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

export function* execVerifyCurrentUserPubkey(){
  yield put({type: VERIFY_CURRENT_USER_PUBKEY})
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
