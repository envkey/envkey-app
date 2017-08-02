import R from 'ramda'
import { takeEvery, put, call, take, select } from 'redux-saga/effects'
import {
  apiSaga,
  signTrustedPubkeys,
  inviteUser,
  execCreateAssoc
} from './helpers'
import {
  ADD_ASSOC_REQUEST,
  ADD_ASSOC_SUCCESS,
  ADD_ASSOC_FAILED,
  REMOVE_ASSOC_REQUEST,
  REMOVE_ASSOC_SUCCESS,
  REMOVE_ASSOC_FAILED,
  CREATE_ASSOC_REQUEST,
  CREATE_ASSOC_SUCCESS,
  CREATE_ASSOC_FAILED,
  CREATE_OBJECT_REQUEST,
  CREATE_OBJECT_SUCCESS,
  CREATE_OBJECT_FAILED,
  GENERATE_ASSOC_KEY,
  GENERATE_ASSOC_KEY_REQUEST,
  GENERATE_ASSOC_KEY_SUCCESS,
  GENERATE_ASSOC_KEY_FAILED,
  GRANT_ENV_ACCESS,
  addAssoc,
  generateKeyRequest,
  addTrustedPubkey,
  updateTrustedPubkeys
} from "actions"
import {attachAssocEnvs} from './helpers/attach_envs'
import {
  generateKeys,
  secureRandomAlphanumeric,
  encryptJson,
  signPublicKey,
  decryptPrivateKey,
  getPubkeyFingerprint
} from 'lib/crypto'
import {
  getCurrentOrg,
  getCurrentUser,
  getServer,
  getAppUser,
  getRawEnvWithPendingForApp,
  getPrivkey
} from 'selectors'
import {getAssocUrl} from 'lib/assoc/helpers'

const
  addRemoveAssocApiSaga = ({method, actionTypes})=> {
    return apiSaga({
      authenticated: true,
      method: method,
      actionTypes: actionTypes,
      urlFn: ({meta})=> {
        const {targetId} = meta,
              targetPath = targetId ? ('/' + targetId) : ''

        return getAssocUrl(meta, targetPath)
      }
    })
  },

  onGenerateKeyRequest = apiSaga({
    authenticated: true,
    method: "patch",
    actionTypes: [GENERATE_ASSOC_KEY_SUCCESS, GENERATE_ASSOC_KEY_FAILED],
    urlFn: ({meta})=> getAssocUrl(meta, `/${meta.targetId}/generate_key`)
  })

function* onAddAssoc(action){
  const actionWithEnvs = yield call(attachAssocEnvs, action),
        apiSaga = addRemoveAssocApiSaga({
          method: "post",
          actionTypes: [ADD_ASSOC_SUCCESS, ADD_ASSOC_FAILED]
        })

  yield call(apiSaga, actionWithEnvs)
}

function* onRemoveAssoc(action){
  const actionWithEnvs = yield call(attachAssocEnvs, action),
        apiSaga = addRemoveAssocApiSaga({
          method: "delete",
          actionTypes: [REMOVE_ASSOC_SUCCESS, REMOVE_ASSOC_FAILED]
        })

  yield call(apiSaga, actionWithEnvs)
}

function* onCreateAssoc(action){
  const {meta} = action
  if (meta.parentType == "app" && meta.assocType == "user"){
    yield call(inviteUser, action)
  } else {
    yield call(execCreateAssoc, action)
  }
}

function* onGenerateKey(action){
  const
    currentOrg = yield select(getCurrentOrg),

    {meta: {parent: app, assocType, targetId}} = action,

    selector = {server: getServer, appUser: getAppUser}[assocType],

    target = yield select(selector(targetId)),

    assocId = {server: targetId, appUser: target.userId}[assocType],

    environment = {server: target.role, appUser: "development"}[assocType],

    passphrase = secureRandomAlphanumeric(16),

    {
      privateKeyArmored: encryptedPrivkey,
      publicKeyArmored: pubkey
    } = yield call(generateKeys, {
      email: ([currentOrg.slug, app.slug, target.slug].join("-") + "@envkey.com"),
      passphrase
    }),

    decryptedPrivkey = yield decryptPrivateKey({
      privkey: encryptedPrivkey, passphrase
    }),

    currentUserPrivkey = yield select(getPrivkey),

    signedPubkey = yield signPublicKey({pubkey, privkey: currentUserPrivkey}),

    rawEnv = yield select(getRawEnvWithPendingForApp({appId: app.id, environment})),

    encryptedRawEnv = yield encryptJson({
      pubkey: signedPubkey,
      privkey: currentUserPrivkey,
      data: rawEnv
    }),

    signedTrustedPubkeys = yield call(signTrustedPubkeys, decryptedPrivkey)

  yield put(generateKeyRequest({
    ...action.meta,
    assocId,
    encryptedPrivkey,
    encryptedRawEnv,
    passphrase,
    signedTrustedPubkeys,
    pubkey: signedPubkey,
    pubkeyFingerprint: getPubkeyFingerprint(signedPubkey)
  }))
}

function *onGenerateKeySuccess({meta: {assocType, targetId}}){
  const
    {id: orgId} = yield select(getCurrentOrg),

    selector = {server: getServer, appUser: getAppUser}[assocType],

    target = yield select(selector(targetId))

  yield put(addTrustedPubkey({keyable: {type: assocType, ...target}, orgId}))

  yield put(updateTrustedPubkeys())
}

export default function* assocSagas(){
  yield [
    takeEvery(ADD_ASSOC_REQUEST, onAddAssoc),
    takeEvery(REMOVE_ASSOC_REQUEST, onRemoveAssoc),
    takeEvery(CREATE_ASSOC_REQUEST, onCreateAssoc),
    takeEvery(GENERATE_ASSOC_KEY, onGenerateKey),
    takeEvery(GENERATE_ASSOC_KEY_REQUEST, onGenerateKeyRequest),
    takeEvery(GENERATE_ASSOC_KEY_SUCCESS, onGenerateKeySuccess)
  ]
}
