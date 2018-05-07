import { put, select, call } from 'redux-saga/effects'
import R from 'ramda'
import {envParamsForApp} from './attach_envs_helpers'
import {signTrustedPubkeyChain} from './crypto_helpers'
import {processS3Uploads} from './s3_storage_helpers'
import {
  getEnvsWithMetaWithPending,
  getEnvActionsPendingByEnvUpdateId,
  getEnvUpdateId,
  getIsRequestingEnvUpdate,
  getHasEnvActionsPending,
  getObject,
  getSocketUserUpdatingEnvs,
  getServersForSubEnv,
  getCurrentOrg,
  getServer,
  getUser,
  getPrivkey
} from 'selectors'
import {
  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
  updateEnvRequest,
  removeAssoc,
  addAssoc
} from "actions"

let dispatchingEnvUpdateId

export function* dispatchEnvUpdateRequest(params){
  const {meta={}, parentId, parentType, skipDelay, updatePending} = params,
        envUpdateId = meta.forceEnvUpdateId || (yield select(getEnvUpdateId(parentId)))

  if(dispatchingEnvUpdateId == envUpdateId && !updatePending)return
  dispatchingEnvUpdateId = envUpdateId

  const
    currentOrg = yield select(getCurrentOrg),
    parent = yield select(getObject(parentType, parentId)),
    envsWithMeta = yield select(getEnvsWithMetaWithPending(parentType, parentId)),
    envActionsPendingBefore = yield select(getEnvActionsPendingByEnvUpdateId(parentId, envUpdateId)),
    signedByTrustedPubkeys = yield call(signTrustedPubkeyChain),
    envActionsPending = yield select(getEnvActionsPendingByEnvUpdateId(parentId, envUpdateId)),
    privkey = yield select(getPrivkey)

  let envParams = yield call(envParamsForApp, {appId: parentId, envsWithMeta})

  if (envActionsPendingBefore.length != envActionsPending.length){
    yield call(dispatchEnvUpdateRequest, {...params, updatePending: true})
    return
  }

  if (currentOrg.s3Storage){
    envParams = yield call(processS3Uploads, envParams)
  }

  yield put(updateEnvRequest({
    ...meta,
    parentType,
    parentId,
    envActionsPending,
    skipDelay,
    envUpdateId,
    signedByTrustedPubkeys,
    updatedEnvsWithMeta: envsWithMeta,
    envs: envParams,
    envsUpdatedAt: parent.envsUpdatedAt,
    keyablesUpdatedAt: parent.keyablesUpdatedAt
  }))

  dispatchingEnvUpdateId = null
}

export function* dispatchEnvUpdateRequestIfNeeded(params){
  const {parentId} = params,
        hasPending = yield select(getHasEnvActionsPending(parentId)),
        isRequestingEnvUpdate = yield select(getIsRequestingEnvUpdate(parentId)),
        socketUserUpdatingEnvs = yield select(getSocketUserUpdatingEnvs(parentId))

  if (hasPending && !isRequestingEnvUpdate && !socketUserUpdatingEnvs){
    yield call(dispatchEnvUpdateRequest, params)
  }
}

export function* clearSubEnvServersIfNeeded({meta: {envActionsPending, parentId}}){
  const removeSubEnvActions = envActionsPending.filter(R.propEq("type", REMOVE_SUB_ENV))

  for (let {meta: {id}} of removeSubEnvActions){
    let servers = yield select(getServersForSubEnv(parentId, id))

    for (let server of servers){
      yield put(removeAssoc({parentId, parentType: "app", assocType: "server", targetId: server.id}))
    }
  }
}

export function* addDefaultSubEnvServerIfNeeded({meta: {envActionsPending, parentId}}){
  const addSubEnvActions = envActionsPending.filter(R.propEq("type", ADD_SUB_ENV))

  for (let {payload: {environment, name, id: subEnvId}} of addSubEnvActions){
    yield put(addAssoc({
      parentId,
      subEnvId,
      name: `${name} Key`,
      role: environment,
      parentType: "app",
      assocType: "server",
      skipKeygen: true,
      undeletable: true
    }))
  }
}
