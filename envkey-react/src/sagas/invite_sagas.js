import { takeLatest, put, select, call, take } from 'redux-saga/effects'
import { push } from 'react-router-redux'
import {
  getCurrentOrg
} from 'selectors'
import {
  redirectFromOrgIndexIfNeeded
} from './helpers'
import {
  SOCKET_SUBSCRIBE_ORG_CHANNEL,
  ACCEPT_INVITE,
  ACCEPT_INVITE_SUCCESS,
  DECRYPT_PRIVKEY_SUCCESS,
  INVITE_USER_FAILED
} from 'actions'

function *onAcceptInvite({payload}){
  document.body.className += " preloader-authenticate"
}

function* onAcceptInviteSuccess({meta: {password, orgSlug}}){
  yield take(DECRYPT_PRIVKEY_SUCCESS)

  const currentOrg = yield select(getCurrentOrg)

  yield put(push(`/${currentOrg.slug}`))
  yield put({type: SOCKET_SUBSCRIBE_ORG_CHANNEL})
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
    takeLatest(ACCEPT_INVITE, onAcceptInvite),
    takeLatest(ACCEPT_INVITE_SUCCESS, onAcceptInviteSuccess),
    takeLatest(INVITE_USER_FAILED, onInviteUserFailed)
  ]
}