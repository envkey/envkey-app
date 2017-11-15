import R from 'ramda'
import { LOGOUT, DECRYPT_PRIVKEY_SUCCESS } from 'actions'

export const

  attachCurrentUserId = store => next => action => {
    if ([LOGOUT, DECRYPT_PRIVKEY_SUCCESS].includes(action.type)){
      const state = store.getState()
      return next(R.assocPath(["meta", "currentUserId"], state.auth.id, action))
    }

    return next(action)
  }