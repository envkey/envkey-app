import { put, select, call, take } from 'redux-saga/effects'
import R from 'ramda'
import * as crypto from 'lib/crypto'
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
  updateTrustedPubkeys
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
import { TRUSTED_PUBKEY_PROPS } from 'constants'

const
  devMode = process.env.NODE_ENV == "development" || process.env.BUILD_ENV == "staging",

  doLogging = false

export function* signTrustedPubkeys(signWithPrivkey=null){
  const privkey = signWithPrivkey || (yield select(getPrivkey)),
        trustedPubkeys = yield select(getTrustedPubkeys),
        signed = yield crypto.signCleartextJson({privkey, data: trustedPubkeys})

  return signed
}

export function* signTrustedPubkeyChain(signWithPrivkey=null){
  const privkey = signWithPrivkey || (yield select(getPrivkey)),
        trustedPubkeys = yield select(getTrustedPubkeyChain),
        signed = yield crypto.signCleartextJson({privkey, data: trustedPubkeys})

  return signed
}

export function* keyableIsTrusted(keyable){
  if(doLogging){
    console.log("keyableIsTrusted: checking keyable")
    console.log(keyable)
  }

  const {id: keyableId, pubkey, invitePubkey} = keyable,
        {id: orgId} = yield select(getCurrentOrg),
        trustedPubkeys = yield select(getTrustedPubkeys),
        trusted = R.prop(keyableId, trustedPubkeys)

  if (!(pubkey || invitePubkey)){
    if(doLogging)console.log("keyableIsTrusted: Missing either pubkey or invitePubkey. Not trusted.")
    return false
  }

  if (!trusted){
    if(doLogging)console.log("keyableIsTrusted: Not trusted.")
    return false
  }

  if((pubkey && !trusted.pubkeyFingerprint) || (invitePubkey && !trusted.invitePubkeyFingerprint)){
    if(doLogging)console.log("keyableIsTrusted: Trusted keyable is missing either pubkeyFingerprint or invitePubkeyFingerprint.")
    return false
  }

  const keyableProps = R.pick(TRUSTED_PUBKEY_PROPS, keyable),
        trustedProps = R.pick(TRUSTED_PUBKEY_PROPS, trusted)

  if(doLogging){
    console.log("keyableIsTrusted: keyableProps -- ", keyableProps)
    console.log("keyableIsTrusted: trustedProps -- ", trustedProps)
  }

  if (!R.equals(keyableProps, trustedProps)){
    if(doLogging)console.log("keyableIsTrusted: keyable props do not match trusted keyable props.")
    return false
  }

  if(pubkey && crypto.getPubkeyFingerprint(pubkey) != trusted.pubkeyFingerprint){
    if(doLogging)console.log("keyableIsTrusted: pubkeyFingerprint does not match pubkey")
    return false
  }

  if(invitePubkey && crypto.getPubkeyFingerprint(invitePubkey) != trusted.invitePubkeyFingerprint){
    if(doLogging)console.log("keyableIsTrusted: invitePubkeyFingerprint does not match invitePubkey")
    return false
  }

  if(doLogging)console.log("keyableIsTrusted: trusted.")

  return true
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

        let signedByUser = yield select(getUser(signedById)),

            trusted = yield call(keyableIsTrusted, signedByUser)

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

export function* decryptAllEnvParents(firstTarget, background=false){
  const apps = yield select(getApps)

  if (apps.length === 0)return false

  if (firstTarget){
    yield put(decryptEnvs({...firstTarget, background, decryptAllAction: true}))
  }

  for (let {id: targetId, encryptedEnvsWithMeta} of apps){
    if (encryptedEnvsWithMeta){
      yield put(decryptEnvs({objectType: "app", targetId, background, decryptAllAction: true}))
    }
  }

  return true
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
