import { takeEvery, takeLatest, take, put, select, call, fork} from 'redux-saga/effects'
import {push} from 'react-router-redux'
import R from 'ramda'
import merge from 'lodash/merge'
import {apiSaga, appServiceEnvs} from './helpers'
import pluralize from 'pluralize'
import {decamelize} from 'xcase'
import {
  // FETCH_OBJECT_DETAILS_REQUEST,
  // FETCH_OBJECT_DETAILS_SUCCESS,
  // FETCH_OBJECT_DETAILS_FAILED,

  CREATE_OBJECT_REQUEST,
  CREATE_OBJECT_SUCCESS,
  CREATE_OBJECT_FAILED,

  UPDATE_OBJECT_SETTINGS_REQUEST,
  UPDATE_OBJECT_SETTINGS_SUCCESS,
  UPDATE_OBJECT_SETTINGS_FAILED,

  RENAME_OBJECT_REQUEST,
  RENAME_OBJECT_SUCCESS,
  RENAME_OBJECT_FAILED,

  REMOVE_OBJECT_REQUEST,
  REMOVE_OBJECT_SUCCESS,
  REMOVE_OBJECT_FAILED,

  API_SUCCESS,
  API_FAILED
} from "actions"
import {
  getCurrentOrg,
  getAppsForService,
  getAppServiceBy
} from "selectors"

// const fetchObjectDetails = apiSaga({
//   authenticated: true,
//   method: "get",
//   actionTypes: [FETCH_OBJECT_DETAILS_SUCCESS, FETCH_OBJECT_DETAILS_FAILED],
//   urlFn: ({meta: {objectType}, payload: id})=> `/${pluralize(objectType)}/${id}.json`
// })

const
  getUpdateUrlFn = (path)=> ({meta: {objectType, targetId}}) => {
    return `/${pluralize(decamelize(objectType))}/${targetId}${path ? ('/' + path): ''}.json`
  },

  onCreateObject = apiSaga({
    authenticated: true,
    method: "post",
    actionTypes: [CREATE_OBJECT_SUCCESS, CREATE_OBJECT_FAILED],
    urlFn: ({meta: {objectType}}) => `/${pluralize(objectType)}.json`
  }),

  onUpdateObjectSettings = apiSaga({
    authenticated: true,
    method: "patch",
    actionTypes: [UPDATE_OBJECT_SETTINGS_SUCCESS, UPDATE_OBJECT_SETTINGS_FAILED],
    urlFn: getUpdateUrlFn("update_settings")
  }),

  onRenameObject = apiSaga({
    authenticated: true,
    method: "patch",
    actionTypes: [RENAME_OBJECT_SUCCESS, RENAME_OBJECT_FAILED],
    urlFn: getUpdateUrlFn("rename")
  }),

  onRemoveObject = function*(action){
    let actionWithEnvs
    const {type, meta: {objectType, targetId: serviceId}} = action,
          currentOrg = yield select(getCurrentOrg)

    if (objectType == "service"){
      let mergedEnvParams = {}
      const apps = yield select(getAppsForService(serviceId))

      for (let {id: appId} of apps){
        let {id: appServiceId} = yield select(getAppServiceBy({appId, serviceId})),
            envParams = yield call(appServiceEnvs, {type, appId, assocId: serviceId, targetId: appServiceId})

        merge(mergedEnvParams, envParams)
      }
      actionWithEnvs = R.assocPath(["payload", "envs"], mergedEnvParams, action)

    } else {
      actionWithEnvs = action
    }

    yield fork(apiSaga({
      authenticated: true,
      method: "delete",
      actionTypes: [REMOVE_OBJECT_SUCCESS, REMOVE_OBJECT_FAILED],
      urlFn:  getUpdateUrlFn()
    }), actionWithEnvs)

    const {type: resultType} = yield take([API_SUCCESS, API_FAILED])
    if (resultType == API_SUCCESS) yield put(push(`/${currentOrg.slug}`))
  },

  onCreateObjectSuccess = function*({meta: {createAssoc, objectType}, payload: {slug}}){
    if(createAssoc)return
    const currentOrg = yield select(getCurrentOrg),
          path = `/${currentOrg.slug}/${pluralize(objectType)}/${slug}`

    yield put(push(path))
  }

export default function* objectSagas(){
  yield [
    // takeEvery(FETCH_OBJECT_DETAILS_REQUEST, fetchObjectDetails)
    takeEvery(CREATE_OBJECT_REQUEST, onCreateObject),
    takeEvery(UPDATE_OBJECT_SETTINGS_REQUEST, onUpdateObjectSettings),
    takeEvery(RENAME_OBJECT_REQUEST, onRenameObject),
    takeEvery(REMOVE_OBJECT_REQUEST, onRemoveObject),

    takeLatest(CREATE_OBJECT_SUCCESS, onCreateObjectSuccess),
  ]
}
