import { takeLatest, take, put, select, call} from 'redux-saga/effects'
import {delay} from 'redux-saga'
import { push } from 'react-router-redux'
import {
  apiSaga,
  redirectFromOrgIndexIfNeeded
} from './helpers'
import {
  UPDATE_ORG_OWNER_SUCCESS,
  CREATE_ORG_SUCCESS,
  SOCKET_SUBSCRIBE_ORG_CHANNEL,
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS,
  GENERATE_DEMO_ORG_REQUEST,
  GENERATE_DEMO_ORG_SUCCESS,
  GENERATE_DEMO_ORG_FAILED,
} from 'actions'
import { getCurrentOrg } from 'selectors'

const onGenerateDemoOrgRequest = apiSaga({
  authenticated: false,
  method: "post",
  minDelay: 1200,
  actionTypes: [GENERATE_DEMO_ORG_SUCCESS, GENERATE_DEMO_ORG_FAILED],
  urlFn: (action)=> "/orgs/generate_demo_org.json"
})

function *onCreateOrgSuccess(action){
  const currentOrg = yield select(getCurrentOrg)
  yield take(UPDATE_TRUSTED_PUBKEYS_SUCCESS)

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

function *onUpdateOrgOwnerSuccess(action){
  const currentOrg = yield select(getCurrentOrg)
  yield take(FETCH_CURRENT_USER_UPDATES_API_SUCCESS)
  yield put(push(`/${currentOrg.slug}`))
  yield call(redirectFromOrgIndexIfNeeded)
}

function *onGenerateDemoOrgSuccess({payload: {path}}){
  yield put(push(path))
}

export default function* orgSagas(){
  yield [
    takeLatest(CREATE_ORG_SUCCESS, onCreateOrgSuccess),
    takeLatest(UPDATE_ORG_OWNER_SUCCESS, onUpdateOrgOwnerSuccess),
    takeLatest(GENERATE_DEMO_ORG_REQUEST, onGenerateDemoOrgRequest),
    takeLatest(GENERATE_DEMO_ORG_SUCCESS, onGenerateDemoOrgSuccess)
  ]
}

