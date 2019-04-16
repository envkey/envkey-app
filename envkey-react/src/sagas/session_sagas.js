import { takeEvery, take, select, put } from 'redux-saga/effects'
import {apiSaga} from './helpers'
import {
  COMMIT_SANITIZED_ACTION_LOG,
  COMMIT_SANITIZED_ACTION_LOG_REQUEST,
  COMMIT_SANITIZED_ACTION_LOG_SUCCESS,
  COMMIT_SANITIZED_ACTION_LOG_FAILED,
  REPORT_SANITIZED_ERROR,
  REPORT_SANITIZED_ERROR_REQUEST,
  REPORT_SANITIZED_ERROR_SUCCESS,
  REPORT_SANITIZED_ERROR_FAILED,
  commitSanitizedActionLog
} from 'actions'

const
  onCommitSanitizedActionLogRequest = apiSaga({
    authenticated: true,
    method: "post",
    actionTypes: [COMMIT_SANITIZED_ACTION_LOG_SUCCESS, COMMIT_SANITIZED_ACTION_LOG_FAILED],
    urlFn: (action)=> `/sanitized_client_sessions.json`
  }),
  onReportSanitizedErrorRequest = apiSaga({
    authenticated: true,
    method: "post",
    actionTypes: [REPORT_SANITIZED_ERROR_SUCCESS, REPORT_SANITIZED_ERROR_FAILED],
    urlFn: (action)=> `/sanitized_client_errors.json`
  })

function *onCommitSanitizedActionLog (action){
  const
    state = yield select(),
    auth = (action.meta && action.meta.overrideAuth || state.auth)

  if ( auth &&
       auth["access-token"] &&
       state.sanitizedActionLog &&
       Object.keys(state.sanitizedActionLog).length > 0){
    yield put({
      ...action,
      type: COMMIT_SANITIZED_ACTION_LOG_REQUEST,
      payload: {clientSessions: state.sanitizedActionLog}
    })
  }
}

export default function* sessionSagas(){
  yield [
    takeEvery(COMMIT_SANITIZED_ACTION_LOG, onCommitSanitizedActionLog),
    takeEvery(COMMIT_SANITIZED_ACTION_LOG_REQUEST, onCommitSanitizedActionLogRequest),
    takeEvery(REPORT_SANITIZED_ERROR_REQUEST, onReportSanitizedErrorRequest)
  ]
}