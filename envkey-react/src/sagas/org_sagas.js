import { takeLatest, take, put, select, call} from 'redux-saga/effects'
import R from 'ramda'
import {apiSaga, envParamsForUpdateOrgRole} from './helpers'
import {
  UPDATE_ORG_ROLE,
  UPDATE_ORG_ROLE_REQUEST,
  UPDATE_ORG_ROLE_SUCCESS,
  UPDATE_ORG_ROLE_FAILED,
  updateOrgRoleRequest
} from "actions"

const
  onUpdateOrgRoleRequest = apiSaga({
    authenticated: true,
    method: "post",
    actionTypes: [UPDATE_ORG_ROLE_SUCCESS, UPDATE_ORG_ROLE_FAILED],
    urlFn: (action)=> `/org_users.json`
  })

function *onUpdateOrgRole({payload: {role, userId, orgUserId}}){
  const envs = yield call(envParamsForUpdateOrgRole, {userId, role})
  yield put(updateOrgRoleRequest({envs, role, userId, orgUserId}))
}

export default function* orgSagas(){
  yield [
    takeLatest(UPDATE_ORG_ROLE, onUpdateOrgRole),
    takeLatest(UPDATE_ORG_ROLE_REQUEST, onUpdateOrgRoleRequest)
  ]
}

