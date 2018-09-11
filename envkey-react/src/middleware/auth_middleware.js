import R from 'ramda'
import { LOGOUT, RESET_SESSION, DECRYPT_PRIVKEY_SUCCESS } from 'actions'

export const

  attachCurrentUserId = store => next => action => {
    if ([LOGOUT, RESET_SESSION, DECRYPT_PRIVKEY_SUCCESS].includes(action.type)){
      const state = store.getState()
      if (state.auth){
        return next(R.assocPath(["meta", "currentUserId"], state.auth.id, action))
      }
    }

    return next(action)
  }