import R from 'ramda'
import {
  FETCH_CURRENT_USER_ACTION_TYPES,
  RESET_SESSION_ACTION_TYPES
} from 'constants'

const
  isActionType = (base, action, opts={})=> {
    const types = R.difference(base, opts.except || []).concat(opts.add || [])
    return types.includes(action.type)
  }

export const

  indexById = objects => R.indexBy(R.prop("id"), objects),

  isFetchCurrentUserAction = (action, opts) => isActionType(FETCH_CURRENT_USER_ACTION_TYPES, action, opts),

  isClearSessionAction = (action, opts) => isActionType(RESET_SESSION_ACTION_TYPES, action, opts)