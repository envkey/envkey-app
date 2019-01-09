import { takeLatest, take, put, select, call} from 'redux-saga/effects'
import {delay} from 'redux-saga'
import { push } from 'react-router-redux'
import {
  apiSaga,
  redirectFromOrgIndexIfNeeded
} from './helpers'
import { ActionType } from 'actions'
import { getCurrentOrg } from 'selectors'

const onGenerateDemoOrgRequest = apiSaga({
  authenticated: false,
  method: "post",
  minDelay: 1200,
  actionTypes: [ActionType.GENERATE_DEMO_ORG_SUCCESS, ActionType.GENERATE_DEMO_ORG_FAILED],
  urlFn: (action)=> "/orgs/generate_demo_org.json"
})

function *onCreateOrgSuccess(action){
  const currentOrg = yield select(getCurrentOrg)
  yield take(ActionType.UPDATE_TRUSTED_PUBKEYS_SUCCESS)

  yield put(push(`/${currentOrg.slug}`))
  yield put({ type: ActionType.SOCKET_SUBSCRIBE_ORG_CHANNEL})
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
  yield take(ActionType.FETCH_CURRENT_USER_UPDATES_API_SUCCESS)
  yield put(push(`/${currentOrg.slug}`))
  yield call(redirectFromOrgIndexIfNeeded)
}

function *onGenerateDemoOrgSuccess({payload: {path}}){
  yield put(push(path))
}

export default function* orgSagas(){
  yield [
    takeLatest(ActionType.CREATE_ORG_SUCCESS, onCreateOrgSuccess),
    takeLatest(ActionType.UPDATE_ORG_OWNER_SUCCESS, onUpdateOrgOwnerSuccess),
    takeLatest(ActionType.GENERATE_DEMO_ORG_REQUEST, onGenerateDemoOrgRequest),
    takeLatest(ActionType.GENERATE_DEMO_ORG_SUCCESS, onGenerateDemoOrgSuccess)
  ]
}

