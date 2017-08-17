import { put, select, call } from 'redux-saga/effects'
import {envParamsForApp} from './attach_envs_helpers'
import {signTrustedPubkeyChain} from './crypto_helpers'
import {
  getEnvsWithMetaWithPending,
  getEnvActionsPendingByEnvUpdateId,
  getEnvUpdateId,
  getIsRequestingEnvUpdate,
  getHasEnvActionsPending,
  getObject,
  getSocketUserUpdatingEnvs
} from 'selectors'
import { updateEnvRequest } from "actions"

export function* dispatchEnvUpdateRequest({
  meta={},
  parentId,
  parentType,
  skipDelay
}){
  const parent = yield select(getObject(parentType, parentId)),
        envsWithMeta = yield select(getEnvsWithMetaWithPending(parentType, parentId)),
        envUpdateId = meta.forceEnvUpdateId || (yield select(getEnvUpdateId(parentId))),
        envActionsPending = yield select(getEnvActionsPendingByEnvUpdateId(parentId, envUpdateId)),
        envParams = yield call(envParamsForApp, {appId: parentId, envsWithMeta}),
        signedByTrustedPubkeys = yield call(signTrustedPubkeyChain)

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