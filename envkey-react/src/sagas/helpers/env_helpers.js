import { put, select, call } from 'redux-saga/effects'
import R from 'ramda'
import {envParamsForApp} from './attach_envs_helpers'
import {signTrustedPubkeyChain} from './crypto_helpers'
import {
  getEnvsWithMetaWithPending,
  getEnvActionsPendingByEnvUpdateId,
  getEnvUpdateId,
  getIsRequestingEnvUpdate,
  getHasEnvActionsPending,
  getObject,
  getSocketUserUpdatingEnvs,
  getServersForSubEnv
} from 'selectors'
import {
  REMOVE_SUB_ENV,
  updateEnvRequest,
  removeAssoc
} from "actions"

let dispatchingEnvUpdateId

export function* dispatchEnvUpdateRequest(params){
  const {meta={}, parentId, parentType, skipDelay, updatePending} = params,
        envUpdateId = meta.forceEnvUpdateId || (yield select(getEnvUpdateId(parentId)))

  if(dispatchingEnvUpdateId == envUpdateId && !updatePending)return
  dispatchingEnvUpdateId = envUpdateId

  const
    parent = yield select(getObject(parentType, parentId)),
    envsWithMeta = yield select(getEnvsWithMetaWithPending(parentType, parentId)),
    envActionsPendingBefore = yield select(getEnvActionsPendingByEnvUpdateId(parentId, envUpdateId)),
    envParams = yield call(envParamsForApp, {appId: parentId, envsWithMeta}),
    signedByTrustedPubkeys = yield call(signTrustedPubkeyChain),
    envActionsPending = yield select(getEnvActionsPendingByEnvUpdateId(parentId, envUpdateId))

  if (envActionsPendingBefore.length != envActionsPending.length){
    yield call(dispatchEnvUpdateRequest, {...params, updatePending: true})
    return
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