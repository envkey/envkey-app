import R from 'ramda'
import { take, put, call, select, takeEvery, takeLatest } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import pluralize from 'pluralize'
import {decamelize} from 'xcase'
import {apiSaga, envParamsForApp, envParamsForService} from './helpers'
import {
  getEnvsWithMetaWithPending,
  getRawEnvWithPendingForApp,
  getEnvActionsPending
} from 'selectors'
import {
  UPDATE_ENV_REQUEST,
  UPDATE_ENV_SUCCESS,
  UPDATE_ENV_FAILED,
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,
  FETCH_OBJECT_DETAILS_SUCCESS,
  fetchObjectDetails
} from "actions"

const onUpdateEnvRequest = apiSaga({
  authenticated: true,
  method: "patch",
  actionTypes: [UPDATE_ENV_SUCCESS, UPDATE_ENV_FAILED],
  debounce: 1000,
  urlFn: ({meta: {parentType, parentId}})=> {
    const urlSafeParentType = decamelize(pluralize(parentType))
    return `/${urlSafeParentType}/${parentId}/update_envs.json`
  }
})

function* onTransformEnv(action){
  const {meta, payload} = action,
        {parent, parentType, parentId} = meta,
        envsWithMeta = yield select(getEnvsWithMetaWithPending({parent, parentType})),
        pendingEnvActions = yield select(getEnvActionsPending(parentId))


  let envParams
  if (parentType == "app"){
    envParams = yield call(envParamsForApp, {appId: parentId, envsWithMeta})
  } else if (parentType == "service"){
    envParams = yield call(envParamsForService, {serviceId: parentId, envsWithMeta})
  }

  yield put({
    type: UPDATE_ENV_REQUEST,
    meta: {...meta, pendingEnvActions, updatedEnvsWithMeta: envsWithMeta, transformPayload: payload },
    payload: {envs: envParams, envsUpdatedAt: parent.envsUpdatedAt}
  })
}

function* onUpdateEnvFailed({payload, meta: {parentType, parentId}}){
  const error = R.path(["response", "data", "error"], payload)
  if (error == "envs_outdated"){
    yield put(fetchObjectDetails({
      objectType: parentType,
      targetId: parentId,
      decryptEnvs: true
    }))

    yield take(FETCH_OBJECT_DETAILS_SUCCESS)

    const pendingEnvActions = yield select(getEnvActionsPending(parentId))

    for (let pendingAction of pendingEnvActions){
      try {
        yield put(pendingAction)
      } catch (e){
        console.log("Replay pending envs error")
        console.log(e)
        alert(`There was a problem applying your update to ${pendingAction.payload.entryKey}. The key may have been deleted or renamed by another user.`)
      }
    }
  }
}

export default function* envSagas(){
  yield [
    takeEvery([
      CREATE_ENTRY,
      UPDATE_ENTRY,
      REMOVE_ENTRY,
      UPDATE_ENTRY_VAL
    ], onTransformEnv),

    takeLatest(UPDATE_ENV_REQUEST, onUpdateEnvRequest),

    takeLatest(UPDATE_ENV_FAILED, onUpdateEnvFailed)
  ]
}
