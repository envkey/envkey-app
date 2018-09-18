import { takeEvery, takeLatest, take, put, select, call } from 'redux-saga/effects'
import {push} from 'react-router-redux'
import {
  redirectFromOrgIndexIfNeeded
} from './helpers'
import pluralize from 'pluralize'
import {
  SELECTED_OBJECT,
  CREATE_OBJECT_SUCCESS,

  REMOVE_OBJECT_REQUEST,
  REMOVE_OBJECT_SUCCESS,
  REMOVE_OBJECT_FAILED,

  API_SUCCESS,
  API_FAILED,

  SOCKET_UNSUBSCRIBE_OBJECT_CHANNEL,

  socketSubscribeObjectChannel,
  generateEnvUpdateId,

  resetSession
} from "actions"
import {
  getCurrentOrg,
  getObject,
  getEnvUpdateId
} from "selectors"

const
  onSelectedObject = function*({payload: object}){
    yield put({type: SOCKET_UNSUBSCRIBE_OBJECT_CHANNEL})
    const currentOrg = yield select(getCurrentOrg)

    if (object && object.objectType == "app" && object.broadcastChannel && object.id != currentOrg.id){
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
    const {meta: {objectType, targetId, isOnboardAction, noRedirect}} = action,
          currentOrg = yield select(getCurrentOrg),
          target = yield select(getObject(objectType, targetId)),
          shouldClearSession = ((objectType == "user" && targetId == currentUser.id) ||
                                (objectType == "org" && targetId == currentOrg.id))

    const {type: apiResultType} = yield take([API_SUCCESS, API_FAILED])

    if(!isOnboardAction){
      if (apiResultType == API_SUCCESS) {
        // If user just deleted their account or organization, log them out and return
        if (shouldClearSession){
          yield put(push("/home"))
          yield put(resetSession())
        } else if (!noRedirect){
          yield take(REMOVE_OBJECT_SUCCESS)
          yield put(push(`/${currentOrg.slug}`))
          yield call(redirectFromOrgIndexIfNeeded)
        }
      }
    }
  },

  onCreateObjectSuccess = function*({
    meta: {createAssoc, objectType, isOnboardAction, willImport},
    payload
  }){
    const {slug} = payload

    const currentOrg = yield select(getCurrentOrg)

    if (objectType == "app" && isOnboardAction && willImport){
      yield put(push(`/${currentOrg.slug}/onboard/2`))
    } else if(!createAssoc){
      yield put(push(`/${currentOrg.slug}/${pluralize(objectType)}/${slug}`))
    }
  },

  onUpdateObjectSuccess = function*({meta}){
    if (meta.objectType == "app"){
      yield(put(decryptEnvs(meta)))
    }
  },

  onUpdateObjectSettingsFailed = function*({meta, payload}){
      alert(`There was a problem updating the ${meta.objectType}'s settings.
${payload.toString()}`)
  },

  onUpdateNetworkSettingsFailed = function*({meta, payload}){
    if (R.path(["response", "status"], payload) == 422 && meta.message == "Unauthorized IP"){
      alert(`You cannot restrict EnvKey App requests to a network that doesn't include your current IP (${payload.response.data.ip}).`)
    } else {
      alert(`There was a problem updating the ${meta.objectType}'s network settings.
${payload.toString()}`)
    }
  }

export default function* objectSagas(){
  yield [
    takeLatest(SELECTED_OBJECT, onSelectedObject),
    takeEvery(REMOVE_OBJECT_REQUEST, onRemoveObject),
    takeEvery(CREATE_OBJECT_SUCCESS, onCreateObjectSuccess),
    takeLatest(UPDATE_OBJECT_SETTINGS_FAILED, onUpdateObjectSettingsFailed),
    takeLatest(UPDATE_NETWORK_SETTINGS_FAILED, onUpdateNetworkSettingsFailed)
  ]
}
