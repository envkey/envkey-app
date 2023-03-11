import { takeLatest, takeEvery, take, put, select, call } from 'redux-saga/effects'
import {push } from 'react-router-redux'
import {
  redirectFromOrgIndexIfNeeded,
  resolveEnvUpdateConflicts
} from './helpers'
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
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS,
  fetchObjectDetails,
  fetchCurrentUser,
  fetchCurrentUserUpdates,
  socketBroadcastEnvsStatus,
  processedSocketUpdateEnvStatus,
  resetSession,
  selectOrg
} from 'actions'
import {
  getAuth,
  getCurrentOrg,
  getApp,
  getSelectedObject,
  getSelectedObjectType,
  getCurrentUser,
  getCurrentOrgUser,
  getCurrentAppUserForApp,
  getLocalSocketEnvsStatus,
  getEnvironmentLabelsWithSubEnvs,
  getAnonSocketEnvsStatus,
  getSelectedObjectId,
  getSubEnvs,
  getEnvActionsPendingByEnvUpdateId
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
import { allEntriesWithSubEnvs } from 'lib/env/query'
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

function *onSocketUpdateOrg(action){
  const auth = yield select(getAuth),
        currentOrg = yield select(getCurrentOrg)

  // Cancel if not logged in / org selected
  if(!auth || !currentOrg)return

  const currentOrgUser = yield select(getCurrentOrgUser),
        selectedObjectId = yield select(getSelectedObjectId),
        {actorId, actionType, targetType, targetId, appId, meta} = action.payload

  // Do nothing if update message originated with this user
  if(auth.id == actorId)return

  // Handle org deleted
  if (actionType == "deleted" && targetType == "Org" && targetId == currentOrg.id){
    alert("This organization has been deleted by the owner.")
    yield put(push("/home"))
    yield put(resetSession())
    window.location.reload()
    return
  }

  // Handle lost org access
  if (actionType == "deleted" && targetType == "OrgUser" && targetId == currentOrgUser.id){
    alert("Your access to this organization has been removed by an org admin.")
    yield put(push("/home"))
    yield put(resetSession())
    window.location.reload()
    return
  }

  // Handle org access change
  if ((actionType == "created" && targetType == "OrgUser" && meta && meta.userId == auth.id) ||
      (actionType == "updated" && targetType == "Org" && meta && meta.updateType == "update_owner" && meta.userId == auth.id) ){
    alert("Your organization access level has been updated by an org admin.")
    yield put(push(`/${currentOrg.slug}`))
    window.location.reload()
    return
  }

  // Current app deleted
  if (actionType == "deleted" && targetType == "App" && targetId == selectedObjectId){
    alert("This app has been deleted by an org admin.")
    yield put(push(`/${currentOrg.slug}`))
    window.location.reload()
    return
  }

  // Current app access removed
  if (actionType == "deleted" && targetType == "AppUser" && appId == selectedObjectId && meta && meta.userId == auth.id){
    alert("Your access to this app has been removed by an app admin.")
    yield put(push(`/${currentOrg.slug}`))
    window.location.reload()
    return
  }

  // Current app access changed
  if (actionType == "created" && targetType == "AppUser" && meta && meta.userId == auth.id){
    yield put(fetchCurrentUserUpdates({noMinUpdatedAt: true}))
    if(appId == selectedObjectId){
      alert("Your app access level has been updated by an app admin.")
      window.location.reload()
    }
    return
  }

  // Selected user deleted
  if (actionType == "deleted" && targetType == "OrgUser" && meta && meta.userId == selectedObjectId){
    alert("This user has been removed from the organization by an org admin.")
    yield put(push(`/${currentOrg.slug}`))
    window.location.reload()
    return
  }

  // Env update
  if (actionType == "updated" && targetType == "App" && meta && meta.updateType == "update_envs"){
    let app = yield select(getApp(appId))

    if (app){
      const preUpdateEnvsWithMeta = app.envsWithMeta

      yield put(fetchObjectDetails({
        targetId,
        objectType: "app",
        decryptEnvs: true,
        socketUpdate: true,
        socketActorId: actorId,
        socketEnvUpdateId: meta.envUpdateId
      }))

      yield take(FETCH_OBJECT_DETAILS_SUCCESS)

      app = yield select(getApp(appId))
      const envActionsPending = yield select(getEnvActionsPendingByEnvUpdateId(appId, meta.envUpdateId)),
            hasConflict = yield call(resolveEnvUpdateConflicts, {
              envActionsPending,
              preUpdateEnvsWithMeta,
              envUpdateId: meta.envUpdateId,
              parentId: app.id,
              postUpdateEnvsWithMeta: app.envsWithMeta
            })

      if (hasConflict){
        return
      }

      yield call(dispatchEnvUpdateRequestIfNeeded, {
        parent: app,
        parentType: "app",
        parentId: targetId,
        skipDelay: true
      })
    }
    return
  }

  // Subscription updated
  const subscriptionUpdateTypes = ["upgrade_subscription", "update_subscription", "cancel_subscription", "trial_ended", "trial_started"]
  if (actionType == "updated" && targetType == "Org" && meta && subscriptionUpdateTypes.includes(meta.updateType)){
    yield put(fetchCurrentUserUpdates({noMinUpdatedAt: true}))
    return
  }

  // v2 upgrade
  if (actionType == "updated" && targetType == "Org" && meta && (meta.updateType == "upgraded_v2" || meta.updateType == "upgrading_v2" || meta.updateType == "canceled_v2_upgrade"){
    yield put(fetchCurrentUserUpdates({noMinUpdatedAt: true}))
    return
  }


  if (actionType == "deleted" && !(meta && meta.bulkAction)){
    // Other deletes that are not bulk actions
    yield put(fetchCurrentUserUpdates({noMinUpdatedAt: true}))
  } else if (!(meta && meta.bulkAction)){
    // For other non-bulk changes, update in background
    yield put(fetchCurrentUserUpdates())
  }
}

function *onSocketUpdateEnvsStatus(action){
  const currentUser = yield select(getCurrentUser)

  if (!currentUser)return

  // Don't receive updates from current user broadcasts
  if (action.payload.userId == currentUser.id){
    return
  }

  const selectedObject = yield select(getSelectedObject),
        entries = yield call(allEntriesWithSubEnvs, selectedObject.envsWithMeta),
        selectedObjectType = yield select(getSelectedObjectType),
        environments = yield select(getEnvironmentLabelsWithSubEnvs(selectedObject.id)),
        subEnvs = yield select(getSubEnvs(selectedObject.id)),
        deanonStatus = deanonymizeEnvStatus(action.payload.status, entries, environments, subEnvs)

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
  const currentUser = yield select(getCurrentUser)
  if(!currentUser)return

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