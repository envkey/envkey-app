import { takeLatest, takeEvery, put, select, call } from 'redux-saga/effects'
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
  DECRYPT_PRIVKEY_FAILED
} from 'actions'
import {
  getPrivkey,
  getEncryptedPrivkey,
  getApp,
  getService,
  getAllEnvParentsAreDecrypted,
  getEnvsAreDecrypted,
  getEnvsAreDecrypting,
  getIsDecryptingAll
} from 'selectors'
import {
  dispatchDecryptAllIfNeeded,
  decryptEnvParent,
  decryptAllEnvParents
} from './helpers'
import * as crypto from 'lib/crypto'

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

function *onDecryptPrivkeySuccess(action){
  yield call(dispatchDecryptAllIfNeeded)
}

function *onDecryptAll(action){
  const privkey = yield select(getPrivkey),
        encryptedPrivkey = yield select(getEncryptedPrivkey),
        firstTarget = R.path(["meta", "firstTarget"], action)

  if(privkey){
    const needsDecrypt = yield call(decryptAllEnvParents, firstTarget)
    if(!needsDecrypt){
      yield put({type: DECRYPT_ALL_SUCCESS})
    }
  } else if (encryptedPrivkey) {
    yield put({...action, type: DECRYPT_PRIVKEY})
  }
}

function *onDecryptEnvs(action){
  const {meta: {objectType, targetId, decryptAllAction}} = action,
        parentSelector = { app: getApp, service: getService }[objectType](targetId),
        parent = yield select(parentSelector),
        envsAreDecrypted = yield select(getEnvsAreDecrypted(parent.id))

  if(!(decryptAllAction && envsAreDecrypted)){
    try {
      const decryptedParent = yield call(decryptEnvParent, parent)
      yield put({type: DECRYPT_ENVS_SUCCESS, payload: decryptedParent, meta: action.meta})
    } catch (err){
      yield put({type: DECRYPT_ENVS_FAILED, error: true, payload: err, meta: action.meta})
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
    takeLatest(DECRYPT_PRIVKEY_SUCCESS, onDecryptPrivkeySuccess),
    takeLatest(DECRYPT_ALL, onDecryptAll),

    takeEvery(DECRYPT_ENVS, onDecryptEnvs),
    takeEvery(DECRYPT_ENVS_SUCCESS, onDecryptEnvsSuccess)
  ]
}
