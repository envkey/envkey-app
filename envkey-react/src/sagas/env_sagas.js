import R from 'ramda'
import { take, put, call, select, takeEvery } from 'redux-saga/effects'
import pluralize from 'pluralize'
import {decamelize} from 'xcase'
import {apiSaga, envParamsForApp, envParamsForService} from './helpers'
import {
  getEnvsWithMetaWithPending,
  getRawEnvWithPendingForApp,
} from 'selectors'
import {
  UPDATE_ENV_REQUEST,
  UPDATE_ENV_SUCCESS,
  UPDATE_ENV_FAILED,
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL
} from "actions"

const updateEnvApiSaga = apiSaga({
  authenticated: true,
  method: "patch",
  actionTypes: [UPDATE_ENV_SUCCESS, UPDATE_ENV_FAILED],
  minDelay: 800,
  urlFn: ({meta: {parentType, parentId}})=> {
    const parent = decamelize(pluralize(parentType))
    return `/${parent}/${parentId}/update_envs.json`
  }
})

function* onTransformEnv(action){
  const {meta, payload} = action,
        {parent, parentType, parentId} = meta,
        envsWithMeta = yield select(getEnvsWithMetaWithPending({parent, parentType}))

  let envParams
  if (parentType == "app"){
    envParams = yield call(envParamsForApp, {appId: parentId, envsWithMeta})
  } else if (parentType == "service"){
    envParams = yield call(envParamsForService, {serviceId: parentId, envsWithMeta})
  }

  yield put({
    type: UPDATE_ENV_REQUEST,
    meta: {...meta, updatedEnvsWithMeta: envsWithMeta, transformPayload: payload},
    payload: {envs: envParams}
  })
}

export default function* envSagas(){
  yield [
    takeEvery([
      CREATE_ENTRY,
      UPDATE_ENTRY,
      REMOVE_ENTRY,
      UPDATE_ENTRY_VAL
    ], onTransformEnv),

    takeEvery(UPDATE_ENV_REQUEST, updateEnvApiSaga)
  ]
}
