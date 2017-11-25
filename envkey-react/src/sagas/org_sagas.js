import { takeLatest, take, put, select, call} from 'redux-saga/effects'
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
  CREATE_ORG_REQUEST,
  CREATE_ORG_SUCCESS,
  CREATE_ORG_FAILED,
  SOCKET_SUBSCRIBE_ORG_CHANNEL,
  updateOrgRoleRequest,
  addTrustedPubkey
} from 'actions'
import { getCurrentOrg, getCurrentUser } from 'selectors'

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
  })

function *onUpdateOrgRole({payload: {role, userId, orgUserId}}){
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

export default function* orgSagas(){
  yield [
    takeLatest(UPDATE_ORG_ROLE, onUpdateOrgRole),
    takeLatest(UPDATE_ORG_ROLE_REQUEST, onUpdateOrgRoleRequest),
    takeLatest(CREATE_ORG_REQUEST, onCreateOrgRequest),
    takeLatest(CREATE_ORG_SUCCESS, onCreateOrgSuccess)
  ]
}

