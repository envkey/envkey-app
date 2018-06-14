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
  DECRYPT_PRIVKEY_SUCCESS
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

export default function* inviteSagas(){
  yield [
    takeLatest(ACCEPT_INVITE, onAcceptInvite),
    takeLatest(ACCEPT_INVITE_SUCCESS, onAcceptInviteSuccess)
  ]
}