import R from 'ramda'
import {
  LOGIN_SUCCESS,
  REGISTER_SUCCESS,
  LOAD_INVITE_API_SUCCESS,
  ACCEPT_INVITE_SUCCESS,
  SELECT_ACCOUNT,
  APP_LOADED,
  SELECT_ORG,
  TOKEN_INVALID,
  COMMIT_SANITIZED_ACTION_LOG,
  COMMIT_SANITIZED_ACTION_LOG_REQUEST,
  COMMIT_SANITIZED_ACTION_LOG_FAILED,
  COMMIT_SANITIZED_ACTION_LOG_SUCCESS,
  REPORT_SANITIZED_ERROR,
  REPORT_SANITIZED_ERROR_REQUEST,
  REPORT_SANITIZED_ERROR_SUCCESS,
  REPORT_SANITIZED_ERROR_FAILED,
  reportSanitizedError,
  commitSanitizedActionLog
} from "actions"
import uuid from 'uuid'
import { RESET_SESSION_ACTION_TYPES } from 'constants'

let numErrorsReportedInLastMinute = 0

setInterval(()=> numErrorsReportedInLastMinute = 0, 1000 * 60)

export const
  processSessionLogs = store => next => action => {
    const state = store.getState()
    let resAction

    if ([
          LOGIN_SUCCESS,
          REGISTER_SUCCESS,
          LOAD_INVITE_API_SUCCESS,
          ACCEPT_INVITE_SUCCESS,
          SELECT_ACCOUNT
        ].includes(action.type) ||
        (!state.sessionId && state.auth)
      ){
      resAction = R.assocPath(["meta", "sessionId"], uuid(), action)
    } else if (state.sessionId){
      resAction = R.assocPath(["meta", "sessionId"], state.sessionId, action)
    }

    resAction = resAction ?
      R.assocPath(["meta", "timestamp"], new Date().toISOString(), resAction) :
      action

    let res
    try {
      res = next(resAction)

      // if we're resetting the session/changing accounts, flush sanitized action log to server using previously authenticated account
      if (R.without([SELECT_ORG, TOKEN_INVALID], RESET_SESSION_ACTION_TYPES).includes(action.type) &&
          state.auth &&
          resAction.meta &&
          resAction.meta.sessionId){
        store.dispatch(commitSanitizedActionLog({overrideAuth: state.auth}))
      }
    } catch (err){
      if (![
        COMMIT_SANITIZED_ACTION_LOG,
        COMMIT_SANITIZED_ACTION_LOG_REQUEST,
        COMMIT_SANITIZED_ACTION_LOG_FAILED,
        COMMIT_SANITIZED_ACTION_LOG_SUCCESS,
        REPORT_SANITIZED_ERROR,
        REPORT_SANITIZED_ERROR_REQUEST,
        REPORT_SANITIZED_ERROR_SUCCESS,
        REPORT_SANITIZED_ERROR_FAILED,
      ].includes(resAction.type)){
        try {
          if (state.sessionId && state.auth && numErrorsReportedInLastMinute < 5) {
            store.dispatch(commitSanitizedActionLog({ overrideAuth: state.auth }))
          }
        } catch (err2) {}

        if (state.sessionId && state.auth && numErrorsReportedInLastMinute < 5) {
          store.dispatch(reportSanitizedError({ sessionId: state.sessionId, error: err, overrideAuth: state.auth }))
          numErrorsReportedInLastMinute++
        }
      }

      throw(err)
    }

    return res
  }

