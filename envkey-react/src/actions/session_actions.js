import R from 'ramda'
import {
  COMMIT_SANITIZED_ACTION_LOG,
  LOG_TO_SESSION,
  REPORT_SANITIZED_ERROR_REQUEST
} from './action_types'
import { createAction } from 'redux-actions'
import { sanitizeError } from 'lib/log'

export const

  logToSession = createAction(LOG_TO_SESSION, (...logged) => ({logged: logged.length > 1 ? logged : logged[0] })),

  commitSanitizedActionLog = createAction(COMMIT_SANITIZED_ACTION_LOG, R.identity, R.pick(["overrideAuth"])),

  reportSanitizedError = createAction(
    REPORT_SANITIZED_ERROR_REQUEST,
    R.pipe(
      R.pick(["sessionId", "error"]),
      R.evolve({error: sanitizeError})
    ),
    R.pick(["overrideAuth"])
  )