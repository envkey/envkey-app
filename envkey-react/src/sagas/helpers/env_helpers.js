import { put, select, call } from 'redux-saga/effects'
import { delay } from 'redux-saga'
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
  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
  UPDATE_ENV_FAILED,
  updateEnvRequest,
  removeAssoc,
  addAssoc,
  clearPendingEnvUpdate
} from "actions"
import { envUpdateConflicts } from 'lib/env/transform'


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

export function* resolveEnvUpdateConflicts({
  parentId,
  envUpdateId,
  preUpdateEnvsWithMeta,
  postUpdateEnvsWithMeta,
  envActionsPending
}){
  const conflicts = envUpdateConflicts(
    preUpdateEnvsWithMeta,
    postUpdateEnvsWithMeta,
    envActionsPending
  )

  if (conflicts.length){
    yield put(clearPendingEnvUpdate({parentId, envUpdateId}))
    yield call(delay, 50)

    const keys = conflicts.filter(R.complement(R.isNil)),
          keyPart = keys.length ? ` for ${conflicts.map(s => `'${s}'`).join(", ")}` : '',
          msg = `Your update was rejected due to a conflict with recent changes from another user. Check the updated values${keyPart}, then re-apply your update if necessary.`

    alert(msg)
    yield put({
      type: UPDATE_ENV_FAILED,
      payload: "Update conflict.",
      meta: {parentId, envActionsPending},
      error: true
    })
    return true
  } else {
    return false
  }
}


