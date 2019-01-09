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
  getIsFetchingDetails,
  getTrustedPubkeys,
  getConfigBlocksForApp
} from "selectors"

const
  onSelectedObject = function*({payload: {objectType, id}}){
    yield put({ type: ActionType.SOCKET_UNSUBSCRIBE_OBJECT_CHANNEL})
    const currentOrg = yield select(getCurrentOrg),
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
      const isFetchingDetails = yield select(getIsFetchingDetails(id))

      if (!object.detailsLoadedAt && !isFetchingDetails){
        yield put(fetchObjectDetails({
          targetId: id,
          objectType: objectType,
          appId: object.appId,
          decryptEnvs: isEnvParent
        }))

        if (objectType == "app"){
          const successAction = yield take(ActionType.FETCH_OBJECT_DETAILS_API_SUCCESS)
          if (successAction.meta.targetId == id){
            const blocks = yield select(getConfigBlocksForApp(id))

            for (let block of blocks){
              const blockIsFetchingDetails = yield select(getIsFetchingDetails(block.id))

              if (!block.detailsLoadedAt && !blockIsFetchingDetails){
                yield put(fetchObjectDetails({
                  targetId: block.id,
                  objectType: "configBlock",
                  decryptEnvs: true
                }))
              }
            }
          }

        }
      }
    }
  },

  onRemoveObject = function*(action){
    const {meta: {objectType, targetId, isOnboardAction, noRedirect}} = action,
          currentOrg = yield select(getCurrentOrg),
          currentUser = yield select(getCurrentUser),
          target = yield select(getObject(objectType, targetId)),
          shouldClearSession = ((objectType == "user" && targetId == currentUser.id) ||
                                (objectType == "org" && targetId == currentOrg.id))

    const { type: apiResultType } = yield take([ActionType.API_SUCCESS, ActionType.API_FAILED])

    if(!isOnboardAction){
      if (apiResultType == ActionType.API_SUCCESS) {
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
