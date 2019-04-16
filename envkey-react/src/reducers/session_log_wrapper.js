import R from 'ramda'
import {
  LOGIN_SUCCESS,
  REGISTER_SUCCESS,
  LOAD_INVITE_API_SUCCESS,
  ACCEPT_INVITE_SUCCESS,
  SELECT_ACCOUNT,
  COMMIT_SANITIZED_ACTION_LOG_REQUEST,
  COMMIT_SANITIZED_ACTION_LOG_FAILED,
  COMMIT_SANITIZED_ACTION_LOG_SUCCESS,
  SELECT_ORG,
  API_SUCCESS,
  API_FAILED
} from "actions"
import {isClearSessionAction} from './helpers'
import {sanitizeAction, sanitizeState} from '../lib/log'
import diff from 'deep-diff'

function renderDiff(diff) {
  const { kind, path, index, item, lhs, rhs } = diff

  switch (kind) {
    case 'E':
      return [path.join('.'), lhs, '→', rhs]
    case 'N':
      return [path.join('.'), rhs]
    case 'D':
      return [path.join('.')]
    case 'A':
      return [`${path.join('.')}[${index}]`, item]
    default:
      return []
  }
}

const sessionId = (state = null, action)=>{
    if (isClearSessionAction(action, {except: [SELECT_ORG, SELECT_ACCOUNT]})){
      return null
    }

    switch (action.type){
      case LOGIN_SUCCESS:
      case REGISTER_SUCCESS:
      case LOAD_INVITE_API_SUCCESS:
      case ACCEPT_INVITE_SUCCESS:
      case SELECT_ACCOUNT:
        return action.meta.sessionId
      default:
        return state || (action.meta && action.meta.sessionId) || null
    }
  },

  getSanitizedActionLogReducer = (prevState, nextState) => (state = {}, action)=> {
    if (action.type == COMMIT_SANITIZED_ACTION_LOG_REQUEST){
      return R.omit(R.keys(action.payload.clientSessions), state)
    } else if (action.type == COMMIT_SANITIZED_ACTION_LOG_FAILED){
      return R.mergeDeepWith(
        R.pipe(R.concat, R.sortBy(R.prop('timestamp'))),
        state,
        action.meta.requestPayload.clientSessions
       )
    } else if (
      action.meta &&
      action.meta.sessionId &&
      ![COMMIT_SANITIZED_ACTION_LOG_SUCCESS,
        COMMIT_SANITIZED_ACTION_LOG_FAILED,
        API_SUCCESS,
        API_FAILED].includes(action.type)
    ) {
      const
        {sessionId, timestamp} = action.meta,
        diffs = diff(sanitizeState(prevState), sanitizeState(nextState)) || [],
        sanitized = {
          action: sanitizeAction(action),
          diff: diffs.map(renderDiff),
          timestamp
        },
        existing = state[sessionId],
        res = existing ? existing.concat([sanitized]) : [sanitized]
      return {...state, [sessionId]: res}
    }

    return state
  }


export default function (mainReducer){
  return (state={}, action)=> {
    let nextState = mainReducer(R.omit(["sessionId", "sanitizedActionLog"], state), action)
    nextState = R.assoc("sessionId", sessionId(state.sessionId, action), nextState)
    nextState = R.assoc(
      "sanitizedActionLog",
      getSanitizedActionLogReducer(state, nextState)(state.sanitizedActionLog, action),
      nextState
    )
    return nextState
  }
}
