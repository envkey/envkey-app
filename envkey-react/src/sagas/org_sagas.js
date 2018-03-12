import { takeLatest, take, put, select, call} from 'redux-saga/effects'
import {delay} from 'redux-saga'
import { push } from 'react-router-redux'
import R from 'ramda'
import {
  apiSaga,
  envParamsForUpdateOrgRole,
  dispatchDecryptAllIfNeeded,
  redirectFromOrgIndexIfNeeded,
  execUpdateTrustedPubkeys
} from './helpers'
import {
  UPDATE_ORG_ROLE,
  UPDATE_ORG_ROLE_REQUEST,
  UPDATE_ORG_ROLE_SUCCESS,
  UPDATE_ORG_ROLE_FAILED,

  UPDATE_ORG_OWNER_REQUEST,
  UPDATE_ORG_OWNER_SUCCESS,
  UPDATE_ORG_OWNER_FAILED,

  CREATE_ORG_REQUEST,
  CREATE_ORG_SUCCESS,
  CREATE_ORG_FAILED,

  SOCKET_SUBSCRIBE_ORG_CHANNEL,
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS,
  FETCH_CURRENT_USER_UPDATES_SUCCESS,

  REMOVE_OBJECT_SUCCESS,
  REMOVE_OBJECT_FAILED,

  UPDATE_ORG_STORAGE_STRATEGY_REQUEST,
  UPDATE_ORG_STORAGE_STRATEGY_SUCCESS,
  UPDATE_ORG_STORAGE_STRATEGY_FAILED,

  GENERATE_DEMO_ORG_REQUEST,
  GENERATE_DEMO_ORG_SUCCESS,
  GENERATE_DEMO_ORG_FAILED,

  updateOrgRoleRequest,
  updateOrgOwner,
  addTrustedPubkey,
  removeObject,
  fetchCurrentUserUpdates
} from 'actions'
import { getCurrentOrg, getCurrentUser, getOrgUserForUser } from 'selectors'

const
  onUpdateOrgRoleRequest = apiSaga({
    authenticated: true,
    method: "post",
    actionTypes: [UPDATE_ORG_ROLE_SUCCESS, UPDATE_ORG_ROLE_FAILED],
    urlFn: (action)=> `/org_users.json`
  }),

  onCreateOrgRequest = apiSaga({
    authenticated: true,
    method: "post",
    actionTypes: [CREATE_ORG_SUCCESS, CREATE_ORG_FAILED],
    urlFn: (action)=> `/orgs.json`
  }),

  onUpdateOrgOwnerRequest = apiSaga({
    authenticated: true,
    method: "patch",
    urlSelector: getCurrentOrg,
    actionTypes: [UPDATE_ORG_OWNER_SUCCESS, UPDATE_ORG_OWNER_FAILED],
    urlFn: (action, currentOrg)=> `/orgs/${currentOrg.slug}/update_owner.json`
  }),

  onUpdateOrgStorageStrategyRequest = apiSaga({
    authenticated: true,
    method: "patch",
    urlSelector: getCurrentOrg,
    actionTypes: [UPDATE_ORG_STORAGE_STRATEGY_SUCCESS, UPDATE_ORG_STORAGE_STRATEGY_FAILED],
    urlFn: (action, currentOrg)=> `/orgs/${currentOrg.slug}/update_storage_strategy.json`
  }),

  onGenerateDemoOrgRequest = apiSaga({
    authenticated: false,
    method: "post",
    minDelay: 1200,
    actionTypes: [GENERATE_DEMO_ORG_SUCCESS, GENERATE_DEMO_ORG_FAILED],
    urlFn: (action)=> "/orgs/generate_demo_org.json"
  })

function *onUpdateOrgRole({payload: {role, userId, orgUserId}}){
  yield put(fetchCurrentUserUpdates())
  yield take(FETCH_CURRENT_USER_UPDATES_SUCCESS)
  const envs = yield call(envParamsForUpdateOrgRole, {userId, role})
  yield put(updateOrgRoleRequest({envs, role, userId, orgUserId}))
}

function *onCreateOrgSuccess(action){
  const currentOrg = yield select(getCurrentOrg),
        currentUser = yield select(getCurrentUser)

  yield put(addTrustedPubkey({keyable: {type: "user", ...currentUser}, orgId: currentOrg.id}))

  yield call(dispatchDecryptAllIfNeeded)

  const updateTrustedRes = yield call(execUpdateTrustedPubkeys, currentOrg.slug)
  if (!updateTrustedRes.error){
    yield put(push(`/${currentOrg.slug}`))
    yield put({type: SOCKET_SUBSCRIBE_ORG_CHANNEL})
    yield call(redirectFromOrgIndexIfNeeded)
    var overlay = document.getElementById("preloader-overlay")
    if(!overlay.className.includes("hide")){
      overlay.className += " hide"
    }
    document.body.className = document.body.className.replace("no-scroll","")
                                                     .replace("preloader-authenticate","")

  }
}

function *onRemoveSelfFromOrg(action){
  const currentUser = yield select(getCurrentUser),
        orgUser = yield select(getOrgUserForUser(currentUser.id))

  let err

  if (currentUser.role == "org_owner"){
    const {newOwnerId} = action.meta
    yield put(updateOrgOwner({newOwnerId}))
    const updateOwnerRes = yield take([UPDATE_ORG_OWNER_SUCCESS, UPDATE_ORG_OWNER_FAILED])

    if (updateOwnerRes.error){
      err = updateOwnerRes.payload
    }
  }

  if (!err){
    yield put(removeObject({objectType: "orgUser", targetId: orgUser.id}))
    const removeRes = yield take([REMOVE_OBJECT_SUCCESS, REMOVE_OBJECT_FAILED])
    if (removeRes.error){
      err = removeRes.payload
    }
  }

  if (err){
    yield put({type: REMOVE_SELF_FROM_ORG_FAILED, payload: err, error: true})
  } else {
    yield put({type: REMOVE_SELF_FROM_ORG_SUCCESS})
  }
}

function *onUpdateOrgOwnerSuccess(action){
  const currentOrg = yield select(getCurrentOrg)
  yield put(fetchCurrentUserUpdates({noMinUpdatedAt: true}))
  yield take(FETCH_CURRENT_USER_UPDATES_API_SUCCESS)
  yield put(push(`/${currentOrg.slug}`))
  yield call(redirectFromOrgIndexIfNeeded)
}

function *onUpdateOrgStorageStrategySuccess(action){
  const currentOrg = yield select(getCurrentOrg)
  yield put(fetchCurrentUserUpdates({noMinUpdatedAt: true}))
}

function *onGenerateDemoOrgSuccess({payload: {path}}){
  yield put(push(path))
}

export default function* orgSagas(){
  yield [
    takeLatest(UPDATE_ORG_ROLE, onUpdateOrgRole),
    takeLatest(UPDATE_ORG_ROLE_REQUEST, onUpdateOrgRoleRequest),
    takeLatest(CREATE_ORG_REQUEST, onCreateOrgRequest),
    takeLatest(CREATE_ORG_SUCCESS, onCreateOrgSuccess),
    takeLatest(UPDATE_ORG_OWNER_REQUEST, onUpdateOrgOwnerRequest),
    takeLatest(UPDATE_ORG_OWNER_SUCCESS, onUpdateOrgOwnerSuccess),
    takeLatest(GENERATE_DEMO_ORG_REQUEST, onGenerateDemoOrgRequest),
    takeLatest(GENERATE_DEMO_ORG_SUCCESS, onGenerateDemoOrgSuccess),
    takeLatest(UPDATE_ORG_STORAGE_STRATEGY_REQUEST, onUpdateOrgStorageStrategyRequest),
    takeLatest(UPDATE_ORG_STORAGE_STRATEGY_SUCCESS, onUpdateOrgStorageStrategySuccess)
  ]
}

