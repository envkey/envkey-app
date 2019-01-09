import R from 'ramda'
import { takeLatest, put, select, call, take } from 'redux-saga/effects'
import { push } from 'react-router-redux'
import {
  getCurrentOrg
} from 'selectors'
import {
  redirectFromOrgIndexIfNeeded
} from './helpers'
import { ActionType } from 'actions'

function *onAcceptInvite({payload}){
  document.body.className += " preloader-authenticate"
}

function* onAcceptInviteSuccess({meta: {password, orgSlug}}){
  yield take(ActionType.DECRYPT_PRIVKEY_SUCCESS)

  const currentOrg = yield select(getCurrentOrg)

  yield put(push(`/${currentOrg.slug}`))
  yield put({ type: ActionType.SOCKET_SUBSCRIBE_ORG_CHANNEL})
  yield call(redirectFromOrgIndexIfNeeded)

  const overlay = document.getElementById("preloader-overlay")
  overlay.className += " hide"
}

function* onInviteUserFailed(action){
  const status = R.path(["payload", "response", "status"], action),
        errorType = R.path(["payload", "response", "data", "errors", 0, "type"], action)
   if (status == 422){
    const msg = {
      already_org_member: "This user is already a member of your organization.",
      already_invited: "This user already has a pending invitation."
    }[errorType]
     if (msg){
      alert(msg)
    }
  }
}

export default function* inviteSagas(){
  yield [
    takeLatest(ActionType.ACCEPT_INVITE, onAcceptInvite),
    takeLatest(ActionType.ACCEPT_INVITE_SUCCESS, onAcceptInviteSuccess),
    takeLatest(ActionType.INVITE_USER_FAILED, onInviteUserFailed)
  ]
}