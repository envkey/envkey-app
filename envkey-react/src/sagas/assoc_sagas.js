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
  processS3Uploads,
  clearAppUserS3Uploads,
  clearRawEnvKeyableS3Upload,
  clearS3Upload,
  execGrantEnvAccess
} from './helpers'
import {
  API_SUCCESS,
  ADD_ASSOC_REQUEST,
  ADD_ASSOC_API_SUCCESS,
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
  fetchCurrentUserUpdates,
  grantEnvAccessRequest
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
  getApp,
  getObject,
  getAppUserBy,
  getOrgUserForUser
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


function* onRevokeKey(action){
  const {meta: {assocType, targetId}} = action,
        currentOrg = yield select(getCurrentOrg),
        keyable = yield select(getObject(assocType, targetId))

  if (currentOrg.s3Storage && keyable && keyable.s3UploadInfo){
    yield call(clearRawEnvKeyableS3Upload, keyable.s3UploadInfo)
  }

  yield call(onRevokeKeyRequest, action)
}

let isPrefetchingUpdatesForAddAssoc = false
function* onAddAssoc(action){
  const currentOrg = yield select(getCurrentOrg)

  let apiAction = action
  const {meta: {parentType, assocType, isCreatingAssoc, shouldPrefetchUpdates, assocId, parentId}} = action,
        apiSaga = addRemoveAssocApiSaga({
          method: "post",
          actionTypes: [ADD_ASSOC_API_SUCCESS, ADD_ASSOC_FAILED]
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

    if (currentOrg.storageStrategy == "s3"){
      const urlPointerParams = yield call(urlPointersForAppUser, {
              appId: parentId,
              userId: assocId
            })

      apiAction = R.assocPath(["payload", "urlPointers"], urlPointerParams, apiAction)
    }
  }

  yield call(apiSaga, apiAction)
}

function* onRemoveAssoc(action){
  const {meta: {parentType, parentId, assocType, assocId}} = action,
        currentOrg = yield select(getCurrentOrg),
        apiSaga = addRemoveAssocApiSaga({
          method: "delete",
          actionTypes: [REMOVE_ASSOC_SUCCESS, REMOVE_ASSOC_FAILED]
        })

  if (parentType == "app" && assocType == "user"){
    if (currentOrg.s3Storage){
      yield call(clearAppUserS3Uploads, {appId: parentId, userId: assocId})
    }
  }

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

function* onAddAssocApiSuccess(action){
  const {meta, payload} = action,
        {parentType, parentId, assocType, assocId} = meta

  if (parentType == "app" && assocType == "user"){
    const userId = assocId,
          {id: orgUserId} = yield select(getOrgUserForUser(userId))

    const grantEnvAccessRes = yield call(execGrantEnvAccess, {
      payload: [{userId, orgUserId, permittedAppIds: [parentId]}],
      meta
    })

    if (grantEnvAccessRes.error){
      yield put({
        meta,
        type: ADD_ASSOC_FAILED,
        payload: grantEnvAccessRes.payload,
        error: true
      })
      return
    }
  }

  yield put({
    ...action,
    type: ADD_ASSOC_SUCCESS
  })
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
    if (target.pubkey){
      yield call(clearRawEnvKeyableS3Upload, target.s3UploadInfo)
    }

    urlPointer = yield call(createUrlPointer, {target, keyableType: assocType})


    encryptedRawEnv = yield call(execRawEnvKeyableS3Post, {
      s3Info: target.s3UploadInfo.env,
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
    encryptedRawEnv,
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
    takeEvery(ADD_ASSOC_API_SUCCESS, onAddAssocApiSuccess),
    takeEvery(ADD_ASSOC_SUCCESS, onAddAssocSuccess),
    takeEvery(GENERATE_ASSOC_KEY, onGenerateKey),
    takeEvery(GENERATE_ASSOC_KEY_REQUEST, onGenerateKeyRequest),
    takeEvery(GENERATE_ASSOC_KEY_SUCCESS, onGenerateKeySuccess),
    takeEvery(REVOKE_ASSOC_KEY_REQUEST, onRevokeKey)
  ]
}
