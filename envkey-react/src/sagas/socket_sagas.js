import { takeLatest, takeEvery, take, put, select, call } from 'redux-saga/effects'
import {
  SOCKET_SUBSCRIBE_ORG_CHANNEL,
  SOCKET_SUBSCRIBE_ORG_USER_CHANNEL,
  SOCKET_SUBSCRIBE_OBJECT_CHANNEL,
  SOCKET_UNSUBSCRIBE_OBJECT_CHANNEL,
  SOCKET_UPDATE_ENVS,
  SOCKET_BROADCAST_ENVS_STATUS,
  SOCKET_UPDATE_ENVS_STATUS,
  SOCKET_USER_SUBSCRIBED_OBJECT_CHANNEL,
  PROCESSED_SOCKET_UPDATE_ENVS_STATUS,
  SOCKET_UPDATE_LOCAL_STATUS,
  SOCKET_UNSUBSCRIBE_ALL,
  FETCH_OBJECT_DETAILS_SUCCESS,
  fetchObjectDetails,
  socketBroadcastEnvsStatus,
  processedSocketUpdateEnvStatus
} from 'actions'
import {
  getAuth,
  getCurrentOrg,
  getApp,
  getService,
  getSelectedObject,
  getEntries,
  getSelectedObjectType,
  getCurrentUser,
  getCurrentAppUserForApp,
  getLocalSocketEnvsStatus,
  getEnvironmentLabels,
  getAnonSocketEnvsStatus
} from 'selectors'
import {
  UPDATE_ENVS,
  UPDATE_ENVS_STATUS,
  ensureSocket,
  unsubscribeOrgChannels,
  subscribeOrgChannels,
  unsubscribeObjectChannel,
  subscribeObjectChannel,
  broadcastOrgChannel,
  broadcastObjectChannel
} from 'lib/socket'
import { deanonymizeEnvStatus } from 'lib/env/update_status'
import {dispatchEnvUpdateRequestIfNeeded} from './helpers'

function *ensureSocketReady(){
  const auth = yield select(getAuth),
        currentOrg = yield select(getCurrentOrg)
  ensureSocket(auth, currentOrg.slug)
}

function *onSubscribeOrgChannel(){
  const currentOrg = yield select(getCurrentOrg),
        currentUser = yield select(getCurrentUser)
  yield call(ensureSocketReady)

  unsubscribeOrgChannels()
  subscribeOrgChannels(currentOrg, currentUser)
}

function *onUnsubscribeObjectChannel(){
  unsubscribeObjectChannel()
}

function *onUnsubscribeAll(){
  unsubscribeObjectChannel()
  unsubscribeOrgChannels()
}

function *onSubscribeObjectChannel({payload: object}){
  yield call(ensureSocketReady)
  subscribeObjectChannel(object)
}

function *onSocketUpdateEnvs(action){
  const auth = yield select(getAuth),
        {objectType, targetId, actorId, envUpdateId} = action.payload

  // Do nothing if update message originated with this user
  if(auth.id == actorId)return

  const selector = {app: getApp, service: getService}[objectType](targetId),
        object = yield select(selector)

  if (object){
    yield put(fetchObjectDetails({
      objectType,
      targetId,
      decryptEnvs: true,
      socketUpdate: true,
      socketActorId: actorId,
      socketEnvUpdateId: envUpdateId
    }))

    yield take(FETCH_OBJECT_DETAILS_SUCCESS)

    yield call(dispatchEnvUpdateRequestIfNeeded, {
      parent: object,
      parentType: objectType,
      parentId: targetId,
      skipDelay: true
    })
  }
}

function *onSocketUpdateEnvsStatus(action){
  const selectedObject = yield select(getSelectedObject),
        entries = yield call(getEntries, selectedObject.envsWithMeta),
        selectedObjectType = yield select(getSelectedObjectType),
        currentUser = yield select(getCurrentUser),
        environments = yield select(getEnvironmentLabels(selectedObjectType, selectedObject.id)),
        deanonStatus = deanonymizeEnvStatus(action.payload.status, entries, environments)

  yield put(processedSocketUpdateEnvStatus({status: deanonStatus, userId: action.payload.userId}))
}

function *onSocketBroadcastEnvsStatus(action){
  const {id: userId} = yield select(getAuth),
        anonStatus = yield select(getAnonSocketEnvsStatus)

  broadcastObjectChannel(userId, UPDATE_ENVS_STATUS, {status: anonStatus})
}

function *onSocketUserSubscribedObjectChannel(action){
  yield put(socketBroadcastEnvsStatus())
}

function *onSocketUpdateLocalStatus(action){
  yield put(socketBroadcastEnvsStatus())
}

export default function* socketSagas(){
  yield [
    takeLatest(SOCKET_SUBSCRIBE_ORG_CHANNEL, onSubscribeOrgChannel),

    takeLatest(SOCKET_UNSUBSCRIBE_OBJECT_CHANNEL, onUnsubscribeObjectChannel),

    takeLatest(SOCKET_UNSUBSCRIBE_ALL, onUnsubscribeAll),

    takeLatest(SOCKET_SUBSCRIBE_OBJECT_CHANNEL, onSubscribeObjectChannel),

    takeEvery(SOCKET_UPDATE_ENVS, onSocketUpdateEnvs),

    takeEvery(SOCKET_UPDATE_ENVS_STATUS, onSocketUpdateEnvsStatus),

    takeEvery(SOCKET_UPDATE_LOCAL_STATUS, onSocketUpdateLocalStatus),

    takeEvery(SOCKET_BROADCAST_ENVS_STATUS, onSocketBroadcastEnvsStatus),

    takeEvery(SOCKET_USER_SUBSCRIBED_OBJECT_CHANNEL, onSocketUserSubscribedObjectChannel)
  ]
}