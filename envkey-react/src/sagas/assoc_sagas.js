import R from 'ramda'
import { takeEvery, put, call, take, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import {
  apiSaga,
  signTrustedPubkeyChain,
  inviteUser,
  execCreateAssoc,
  attachAssocEnvs,
  execRawEnvKeyableS3Post,
  urlPointersForRawEnvKeyable,
  urlPointersForAppUser,
  createUrlPointer,
  processS3Uploads
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
  REVOKE_ASSOC_KEY_REQUEST,
  REVOKE_ASSOC_KEY_SUCCESS,
  REVOKE_ASSOC_KEY_FAILED,
  GRANT_ENV_ACCESS,
  FETCH_OBJECT_DETAILS_SUCCESS,
  FETCH_CURRENT_USER_UPDATES_SUCCESS,
  addAssoc,
  generateKeyRequest,
  generateKey,
  addTrustedPubkey,
  updateTrustedPubkeys,
  fetchCurrentUserUpdates
} from "actions"
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
  getLocalKey,
  getRawEnvWithPendingForApp,
  getPrivkey,
  getApp
} from 'selectors'
import {getAssocUrl} from 'lib/assoc/helpers'
import { s3Client } from 'lib/s3'

const
  addRemoveAssocApiSaga = ({method, actionTypes})=> {
    return apiSaga({
      method,
      actionTypes,
      authenticated: true,
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
  }),

  onRevokeKeyRequest = apiSaga({
    authenticated: true,
    method: "delete",
    actionTypes: [REVOKE_ASSOC_KEY_SUCCESS, REVOKE_ASSOC_KEY_FAILED],
    urlFn: ({meta})=> getAssocUrl(meta, `/${meta.targetId}/revoke_key`)
  })


let isPrefetchingUpdatesForAddAssoc = false
function* onAddAssoc(action){
  const currentOrg = yield select(getCurrentOrg)

  let apiAction
  const {meta: {parentType, assocType, isCreatingAssoc, shouldPrefetchUpdates, parentId}} = action,
        apiSaga = addRemoveAssocApiSaga({
          method: "post",
          actionTypes: [ADD_ASSOC_SUCCESS, ADD_ASSOC_FAILED]
        })

  if(parentType == "app" && assocType == "user"){
    if (shouldPrefetchUpdates){
      isPrefetchingUpdatesForAddAssoc = true
      yield put(fetchCurrentUserUpdates())
      yield take(FETCH_CURRENT_USER_UPDATES_SUCCESS)
      isPrefetchingUpdatesForAddAssoc = false
    }

    while (isPrefetchingUpdatesForAddAssoc){
      yield call(delay, 50)
    }

    apiAction = yield call(attachAssocEnvs, action)

    if (currentOrg.s3Storage){
      const envParams = yield call(processS3Uploads, apiAction.payload.envs),
            urlPointerParams = yield call(urlPointersForAppUser({appId: parentId, userId: assocId})),

      apiAction = R.pipe(
        R.assocPath(["payload", "urlPointers"], urlPointerParams),
        R.assocPath(["payload", "envs"], envParams)
      )(apiAction)
    }
  } else {
    apiAction = action
  }

  yield call(apiSaga, apiAction)
}

function* onRemoveAssoc(action){
  const apiSaga = addRemoveAssocApiSaga({
          method: "delete",
          actionTypes: [REMOVE_ASSOC_SUCCESS, REMOVE_ASSOC_FAILED]
        })

  yield call(apiSaga, action)
}

function* onCreateAssoc(action){
  const {meta} = action
  if (meta.parentType == "app" && meta.assocType == "user"){
    yield call(inviteUser, action)
  } else {
    yield call(execCreateAssoc, action)
  }
}

function* onAddAssocSuccess({meta, payload: {id: targetId}}){
  const {parentType, assocType} = meta

  if(parentType == "app" && ["server", "localKey"].includes(assocType) && !meta.skipKeygen){
    yield put(generateKey({...meta, targetId}))
  }
}

function* onGenerateKey(action){
  yield put(fetchCurrentUserUpdates())
  yield take(FETCH_CURRENT_USER_UPDATES_SUCCESS)

  const
    currentOrg = yield select(getCurrentOrg),

    {meta: {parent: app, assocType, targetId}} = action,

    selector = {server: getServer, localKey: getLocalKey}[assocType],

    target = yield select(selector(targetId)),

    assocId = {server: targetId, localKey: targetId}[assocType],

    environment = {server: target.role, localKey: "development"}[assocType],

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

    rawEnv = yield select(getRawEnvWithPendingForApp({appId: app.id, environment, subEnvId: target.subEnvId}))

  let [
    encryptedRawEnv,
    signedTrustedPubkeys,
    signedByTrustedPubkeys
  ] = yield [
   encryptJson({
     pubkey: signedPubkey,
     privkey: currentUserPrivkey,
     data: rawEnv
   }),
   call(signTrustedPubkeyChain, decryptedPrivkey),
   call(signTrustedPubkeyChain)
  ]

  let urlPointer
  if (target.s3UploadInfo){
    urlPointer = createUrlPointer({target, keyableType: assocType})
    encryptedRawEnv = yield call(execRawEnvKeyableS3Post, {
      s3Info: target.s3Info,
      env: encryptedRawEnv,
      pubkey: signedPubkey,
      privkey: currentUserPrivkey,
      secret: urlPointer.urlSecret
    })
  }

  let keyRequestAction = generateKeyRequest({
    ...action.meta,
    assocId,
    encryptedPrivkey,
    passphrase,
    signedTrustedPubkeys,
    signedByTrustedPubkeys,
    encryptedRawEnv: (encryptedUrl || encryptedRawEnv),
    pubkey: signedPubkey,
    pubkeyFingerprint: getPubkeyFingerprint(signedPubkey)
  })

  if (target.s3UploadInfo){
    const urlPointerParams = yield call(urlPointersForRawEnvKeyable, {
      urlPointer,
      keyableType: assocType,
      keyableId: targetId,
      appId: app.id
    })

    keyRequestAction = R.assocPath(["payload", "urlPointers"], urlPointerParams, keyRequestAction)
  }

  yield put(keyRequestAction)
}

function *onGenerateKeySuccess({meta: {assocType, targetId}}){
  const
    {id: orgId} = yield select(getCurrentOrg),

    selector = {server: getServer, localKey: getLocalKey}[assocType],

    target = yield select(selector(targetId))

  yield put(addTrustedPubkey({keyable: {type: assocType, ...target}, orgId}))

  yield put(updateTrustedPubkeys())
}

export default function* assocSagas(){
  yield [
    takeEvery(ADD_ASSOC_REQUEST, onAddAssoc),
    takeEvery(REMOVE_ASSOC_REQUEST, onRemoveAssoc),
    takeEvery(CREATE_ASSOC_REQUEST, onCreateAssoc),
    takeEvery(ADD_ASSOC_SUCCESS, onAddAssocSuccess),
    takeEvery(GENERATE_ASSOC_KEY, onGenerateKey),
    takeEvery(GENERATE_ASSOC_KEY_REQUEST, onGenerateKeyRequest),
    takeEvery(GENERATE_ASSOC_KEY_SUCCESS, onGenerateKeySuccess),
    takeEvery(REVOKE_ASSOC_KEY_REQUEST, onRevokeKeyRequest)
  ]
}
