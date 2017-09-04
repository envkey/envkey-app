import { takeEvery, takeLatest, take, put, select, call, fork} from 'redux-saga/effects'
import {push} from 'react-router-redux'
import R from 'ramda'
import merge from 'lodash/merge'
import {apiSaga, redirectFromOrgIndexIfNeeded} from './helpers'
import pluralize from 'pluralize'
import {decamelize} from 'xcase'
import {
  SELECTED_OBJECT,

  FETCH_OBJECT_DETAILS_REQUEST,
  FETCH_OBJECT_DETAILS_API_SUCCESS,
  FETCH_OBJECT_DETAILS_SUCCESS,
  FETCH_OBJECT_DETAILS_FAILED,

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
  API_FAILED,

  CHECK_INVITES_ACCEPTED_REQUEST,

  SOCKET_UNSUBSCRIBE_OBJECT_CHANNEL,

  VERIFY_ORG_PUBKEYS_SUCCESS,

  socketSubscribeObjectChannel,
  generateEnvUpdateId,
  importAllEnvironments,
  decryptEnvs,
  verifyOrgPubkeys,
  logout
} from "actions"
import {
  getCurrentOrg,
  getCurrentUser,
  getIsPollingInviteesPendingAcceptance,
  getEnvUpdateId
} from "selectors"
import {
  decryptEnvParent
} from './helpers'

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

  onFetchObjectDetails = action => apiSaga({
    authenticated: true,
    method: "get",
    minDelay: (action.meta && action.meta.socketUpdate ? 2000 : 0),
    actionTypes: [FETCH_OBJECT_DETAILS_API_SUCCESS, FETCH_OBJECT_DETAILS_FAILED],
    urlFn: ({meta: {objectType, targetId}})=> `/${pluralize(objectType)}/${targetId}.json`
  })(action),

  onSelectedObject = function*({payload: object}){
    yield put({type: SOCKET_UNSUBSCRIBE_OBJECT_CHANNEL})
    const currentOrg = yield select(getCurrentOrg)

    if (object && object.broadcastChannel && object.id != currentOrg.id){
      yield put(socketSubscribeObjectChannel(object))
    }

    if (object.objectType == "app"){
      const envUpdateId = yield select(getEnvUpdateId(object.id))
      if (!envUpdateId){
        yield put(generateEnvUpdateId({parentId: object.id, parentType: object.objectType}))
      }
    }
  },

  onRemoveObject = function*(action){
    const currentOrg = yield select(getCurrentOrg),
          currentUser = yield select(getCurrentUser),
          shouldLogout = ((action.meta.objectType == "user" && action.meta.targetId == currentUser.id) ||
                          (action.meta.objectType == "org" && action.meta.targetId == currentOrg.id))

    yield fork(apiSaga({
      authenticated: true,
      method: "delete",
      actionTypes: [REMOVE_OBJECT_SUCCESS, REMOVE_OBJECT_FAILED],
      urlFn:  getUpdateUrlFn()
    }), action)

    if(!action.meta.isOnboardAction){
      const {type: apiResultType} = yield take([API_SUCCESS, API_FAILED])
      if (apiResultType == API_SUCCESS) {
        // If user just deleted their account or organization, log them out and return
        if (shouldLogout){
          yield put(push("/home"))
          yield put(logout())
          return
        }

        yield put(push(`/${currentOrg.slug}`))
      }

      const {type: resultType} = yield take([REMOVE_OBJECT_SUCCESS, REMOVE_OBJECT_FAILED])
      if (resultType == REMOVE_OBJECT_SUCCESS){
        yield call(redirectFromOrgIndexIfNeeded)
      }
    }
  },

  onFetchObjectDetailsApiSuccess = function*(action){
    if (action.meta.decryptEnvs){
      yield put(verifyOrgPubkeys())
      yield take(VERIFY_ORG_PUBKEYS_SUCCESS)
      const decrypted = yield call(decryptEnvParent, action.payload)
      yield put({...action, type: FETCH_OBJECT_DETAILS_SUCCESS, payload: decrypted})
    } else {
      yield put({...action, type: FETCH_OBJECT_DETAILS_SUCCESS})
    }
  },

  onCreateObjectSuccess = function*({
    meta: {status, createAssoc, objectType, isOnboardAction, willImport, toImport},
    payload
  }){
    const {id, slug} = payload

    if (toImport){
      yield put(importAllEnvironments({
        ...toImport,
        parentType: objectType,
        parentId: id
      }))
    }

    const currentOrg = yield select(getCurrentOrg)

    if (objectType == "app" && isOnboardAction && willImport){
      yield put(push(`/${currentOrg.slug}/onboard/2`))
    } else if(!createAssoc){
      yield put(push(`/${currentOrg.slug}/${pluralize(objectType)}/${slug}`))
    }
  },

  onRenameObjectSuccess = function*({meta}){
    if (meta.objectType == "app"){
      yield(put(decryptEnvs(meta)))
    }
  }

export default function* objectSagas(){
  yield [
    takeLatest(SELECTED_OBJECT, onSelectedObject),
    takeEvery(FETCH_OBJECT_DETAILS_REQUEST, onFetchObjectDetails),
    takeEvery(FETCH_OBJECT_DETAILS_API_SUCCESS, onFetchObjectDetailsApiSuccess),
    takeEvery(CREATE_OBJECT_REQUEST, onCreateObject),
    takeEvery(UPDATE_OBJECT_SETTINGS_REQUEST, onUpdateObjectSettings),
    takeEvery(RENAME_OBJECT_REQUEST, onRenameObject),
    takeEvery(RENAME_OBJECT_SUCCESS, onRenameObjectSuccess),
    takeEvery(REMOVE_OBJECT_REQUEST, onRemoveObject),
    takeEvery(CREATE_OBJECT_SUCCESS, onCreateObjectSuccess),
  ]
}
