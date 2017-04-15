import { takeLatest, takeEvery, put, select, call } from 'redux-saga/effects'
import {
  SOCKET_SUBSCRIBE_ORG_CHANNEL,
  SOCKET_SUBSCRIBE_ORG_USER_CHANNEL,
  SOCKET_SUBSCRIBE_OBJECT_CHANNEL,
  SOCKET_UNSUBSCRIBE_OBJECT_CHANNEL,
  SOCKET_UPDATE_ENVS,
  PROCESSED_SOCKET_UPDATE_ENVS,
  BROADCAST_UPDATE_ENVS_STATUS,
  SOCKET_UPDATE_ENVS_STATUS,
  PROCESSED_SOCKET_UPDATE_ENVS_STATUS,
  SOCKET_USER_SUBSCRIBED_OBJECT_CHANNEL,
  fetchObjectDetails,
  broadcastUpdateEnvsStatus
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
  getLocalSocketEnvsStatus
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
import { processSocketUpdateEnvStatus } from 'lib/env/update_status'

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

function *onSubscribeObjectChannel({payload: object}){
  yield call(ensureSocketReady)
  subscribeObjectChannel(object)
}

function *onSocketUpdateEnvs(action){
  const auth = yield select(getAuth),
        {objectType, targetId, actorId} = action.payload

  // Do nothing if update message originated with this user
  if(auth.id == actorId)return

  const selector = {app: getApp, service: getService}[objectType](targetId),
        object = yield select(selector)

  if (object){
    yield put({...action, type: PROCESSED_SOCKET_UPDATE_ENVS})
    yield put(fetchObjectDetails({
      objectType,
      targetId,
      decryptEnvs: true,
      socketUpdate: true,
      socketActorId: actorId
    }))
  }
}

function *onSocketUpdateEnvsStatus(action){
  const selectedObject = yield select(getSelectedObject),
        entries = yield call(getEntries, selectedObject.envsWithMeta),
        selectedObjectType = yield select(getSelectedObjectType),
        currentUser = yield select(getCurrentUser)

  let environments

  if (selectedObjectType == "app"){
    const currentAppUser = yield select(getCurrentAppUserForApp(selectedObject.id))
    environments = currentAppUser.environmentsAccessible
  } else if (selectedObject == "service"){
    environments = currentUser.permittedServiceEnvironments
  }

  yield put({
    ...action,
    type: PROCESSED_SOCKET_UPDATE_ENVS_STATUS,
    payload: processSocketUpdateEnvStatus(action.payload, entries, environments)
  })
}

function *onBroadcastUpdateEnvsStatus({payload}){
  const {id: userId} = yield select(getAuth)
  broadcastObjectChannel(userId, UPDATE_ENVS_STATUS, payload)
}

function *onSocketUserSubscribedObjectChannel({payload: {userId}}){
  const localSocketEnvsStatus = yield select(getLocalSocketEnvsStatus)
  yield put(broadcastUpdateEnvsStatus(localSocketEnvsStatus))
}

export default function* socketSagas(){
  yield [
    takeLatest(SOCKET_SUBSCRIBE_ORG_CHANNEL, onSubscribeOrgChannel),

    takeLatest(SOCKET_UNSUBSCRIBE_OBJECT_CHANNEL, onUnsubscribeObjectChannel),

    takeLatest(SOCKET_SUBSCRIBE_OBJECT_CHANNEL, onSubscribeObjectChannel),

    takeEvery(SOCKET_UPDATE_ENVS, onSocketUpdateEnvs),

    takeEvery(SOCKET_UPDATE_ENVS_STATUS, onSocketUpdateEnvsStatus),

    takeEvery(BROADCAST_UPDATE_ENVS_STATUS, onBroadcastUpdateEnvsStatus),

    takeEvery(SOCKET_USER_SUBSCRIBED_OBJECT_CHANNEL, onSocketUserSubscribedObjectChannel)
  ]
}