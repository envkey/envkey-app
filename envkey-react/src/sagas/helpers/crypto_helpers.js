import { put, select } from 'redux-saga/effects'
import R from 'ramda'
import * as crypto from 'lib/crypto'
import {
  DECRYPT_ALL,
  decryptEnvs
} from 'actions'
import {
  getPrivkey,
  getEnvAccessGranted,
  getApps,
  getServices,
  getEnvsAreDecrypted,
  getAllEnvParentsAreDecrypted
} from "selectors"

export function* decryptEnvParent(parent){
  const privkey = yield select(getPrivkey)
  if (parent.envsWithMeta){
    let decrypted = {}
    for (let environment in parent.envsWithMeta){
      let encrypted = parent.envsWithMeta[environment]
      decrypted[environment] = encrypted && !R.isEmpty(encrypted) ?
        (yield crypto.decryptJson({encrypted, privkey})) :
        {}
    }
    return R.assoc("envsWithMeta", decrypted, parent)
  } else {
    return parent
  }
}

export function* decryptAllEnvParents(firstTarget){
  const apps = yield select(getApps),
        services = yield select(getServices)

  if ((apps.length + services.length) === 0)return false

  if (firstTarget){
    yield put(decryptEnvs({...firstTarget, decryptAllAction: true}))
  }

  for (let [objectType, objects] of [["app", apps], ["service", services]]){
    for (let {id: targetId} of objects){
      if(!(firstTarget && firstTarget.targetId == targetId)){
        yield put(decryptEnvs({objectType, targetId, decryptAllAction: true}))
      }
    }
  }

  return true
}

export function *dispatchDecryptAllIfNeeded(){
  const privkey = yield select(getPrivkey),
        envAccessGranted = yield select(getEnvAccessGranted)

  if(privkey && envAccessGranted){
    yield put({type: DECRYPT_ALL})
  }
}
