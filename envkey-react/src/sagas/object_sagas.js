import { takeEvery, takeLatest, take, put, select, call } from 'redux-saga/effects'
import {push} from 'react-router-redux'
import {
  redirectFromOrgIndexIfNeeded
} from './helpers'
import pluralize from 'pluralize'
import {
  ActionType,
  socketSubscribeObjectChannel,
  generateEnvUpdateId,
  fetchObjectDetails,
  resetSession
} from "actions"
import {
  getCurrentOrg,
  getCurrentUser,
  getObject,
  getEnvUpdateId,
  getIsFetchingDetails
} from "selectors"

const
  onSelectedObject = function*({payload: {objectType, id}}){
    yield put({ type: ActionType.SOCKET_UNSUBSCRIBE_OBJECT_CHANNEL})
    const state = yield select(),
          privkey = state.privkey,
          currentOrg = yield select(getCurrentOrg),
          object = yield select(getObject(objectType, id))

    const isEnvParent = ["app", "configBlock", "appUser"].includes(objectType)

    if (isEnvParent && object.broadcastChannel && id != currentOrg.id){
      yield put(socketSubscribeObjectChannel(object))
    }

    if (isEnvParent){
      const envUpdateId = yield select(getEnvUpdateId(id))
      if (!envUpdateId){
        yield put(generateEnvUpdateId({parentId: id, parentType: objectType}))
      }
    }

    if (isEnvParent || objectType == "user"){
      const
        isFetchingDetails = yield select(getIsFetchingDetails(id)),
        shouldFetch = (!object.detailsLoadedAt && !isFetchingDetails) ||
                      (privkey && object.detailsLoadedAt && !object.graphUpdatedAt)

      if (shouldFetch){
        yield put(fetchObjectDetails({
          targetId: id,
          objectType: objectType,
          appId: object.appId,
          decryptEnvs: isEnvParent
        }))
      }
    }
  },

  onRemoveObject = function*(action){
    const {meta: {objectType, targetId, isOnboardAction, noRedirect}} = action,
          currentOrg = yield select(getCurrentOrg),
          currentUser = yield select(getCurrentUser),
          shouldClearSession = ((objectType == "user" && targetId == currentUser.id) ||
                                (objectType == "org" && targetId == currentOrg.id))

    const { type: resultType } = yield take([ActionType.STORAGE_GATEWAY_SUCCESS, ActionType.STORAGE_GATEWAY_SUCCESS, ActionType.API_FAILED])

    if(!isOnboardAction){
      if (resultType == ActionType.STORAGE_GATEWAY_SUCCESS) {
        // If user just deleted their account or organization, log them out and return
        if (shouldClearSession){
          yield put(push("/home"))
          yield put(resetSession())
        } else if (!noRedirect){
          yield take(ActionType.REMOVE_OBJECT_SUCCESS)
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
    takeLatest(ActionType.SELECTED_OBJECT, onSelectedObject),
    takeEvery(ActionType.REMOVE_OBJECT_REQUEST, onRemoveObject),
    takeEvery(ActionType.CREATE_OBJECT_SUCCESS, onCreateObjectSuccess),
    takeLatest(ActionType.UPDATE_OBJECT_SETTINGS_FAILED, onUpdateObjectSettingsFailed),
    takeLatest(ActionType.UPDATE_NETWORK_SETTINGS_FAILED, onUpdateNetworkSettingsFailed)
  ]
}
