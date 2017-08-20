import { takeLatest, takeEvery, take, put, select, call } from 'redux-saga/effects'
import {push } from 'react-router-redux'
import {
  SOCKET_SUBSCRIBE_ORG_CHANNEL,
  SOCKET_SUBSCRIBE_ORG_USER_CHANNEL,
  SOCKET_SUBSCRIBE_OBJECT_CHANNEL,
  SOCKET_UNSUBSCRIBE_OBJECT_CHANNEL,
  SOCKET_ORG_UPDATE,
  SOCKET_BROADCAST_ENVS_STATUS,
  SOCKET_UPDATE_ENVS_STATUS,
  SOCKET_USER_SUBSCRIBED_OBJECT_CHANNEL,
  PROCESSED_SOCKET_UPDATE_ENVS_STATUS,
  SOCKET_UPDATE_LOCAL_STATUS,
  SOCKET_UNSUBSCRIBE_ALL,
  FETCH_OBJECT_DETAILS_SUCCESS,
  fetchObjectDetails,
  fetchCurrentUser,
  fetchCurrentUserUpdates,
  socketBroadcastEnvsStatus,
  processedSocketUpdateEnvStatus,
  logout,
  selectOrg
} from 'actions'
import {
  getAuth,
  getCurrentOrg,
  getApp,
  getSelectedObject,
  getEntries,
  getSelectedObjectType,
  getCurrentUser,
  getCurrentOrgUser,
  getCurrentAppUserForApp,
  getLocalSocketEnvsStatus,
  getEnvironmentLabels,
  getAnonSocketEnvsStatus
} from 'selectors'
import {alertBox} from 'lib/ui/alert_box'
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

  const app = yield select(getApp(targetId))

  if (app){
    yield put(fetchObjectDetails({
      targetId,
      objectType: "app",
      decryptEnvs: true,
      socketUpdate: true,
      socketActorId: actorId,
      socketEnvUpdateId: envUpdateId
    }))

    yield take(FETCH_OBJECT_DETAILS_SUCCESS)

    yield call(dispatchEnvUpdateRequestIfNeeded, {
      parent: app,
      parentType: objectType,
      parentId: targetId,
      skipDelay: true
    })
  }
}

function *onSocketUpdateOrg(action){
  const auth = yield select(getAuth),
        currentOrg = yield select(getCurrentOrg),
        currentOrgUser = yield select(getCurrentOrgUser),
        {actorId, actionType, targetType, targetId, appId, meta} = action.payload

  // Do nothing if update message originated with this user
  if(auth.id == actorId)return

  // Handle org deleted
  if (actionType == "deleted" && targetType == "Org" && targetId == currentOrg.id){
    alertBox("This organization has been deleted by the owner.")
    yield put(push("/home"))
    yield put(logout())
    return
  }

  // Handle lost org access
  if (actionType == "deleted" && targetType == "OrgUser" && targetId == currentOrgUser.id){
    alertBox("Your access to this organization has been removed by an org admin.")
    yield put(push("/home"))
    yield put(logout())
    return
  }

  // Handle org access change
  if (actionType == "created" && targetType == "OrgUser" && meta && meta.userId == auth.id){
    alertBox("Your organization access level has been updated by an org admin.")
    yield put(selectOrg(currentOrg.slug))
    return
  }

  if (actionType == "updated" && targetType == "App" && meta && meta.updateType == "update_envs"){
    const app = yield select(getApp(appId))

    if (app){
      yield put(fetchObjectDetails({
        targetId,
        objectType: "app",
        decryptEnvs: true,
        socketUpdate: true,
        socketActorId: actorId,
        socketEnvUpdateId: meta.envUpdateId
      }))

      yield take(FETCH_OBJECT_DETAILS_SUCCESS)

      yield call(dispatchEnvUpdateRequestIfNeeded, {
        parent: app,
        parentType: "app",
        parentId: targetId,
        skipDelay: true
      })
    }
  }
}

function *onSocketUpdateEnvsStatus(action){
  const selectedObject = yield select(getSelectedObject),
        entries = yield call(getEntries, selectedObject.envsWithMeta),
        selectedObjectType = yield select(getSelectedObjectType),
        currentUser = yield select(getCurrentUser),
        environments = yield select(getEnvironmentLabels(selectedObject.id)),
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

    takeEvery(SOCKET_ORG_UPDATE, onSocketUpdateOrg),

    takeEvery(SOCKET_UPDATE_ENVS_STATUS, onSocketUpdateEnvsStatus),

    takeEvery(SOCKET_UPDATE_LOCAL_STATUS, onSocketUpdateLocalStatus),

    takeEvery(SOCKET_BROADCAST_ENVS_STATUS, onSocketBroadcastEnvsStatus),

    takeEvery(SOCKET_USER_SUBSCRIBED_OBJECT_CHANNEL, onSocketUserSubscribedObjectChannel)
  ]
}