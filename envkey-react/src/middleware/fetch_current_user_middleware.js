import R from 'ramda'
import {
  FETCH_CURRENT_USER_UPDATES_REQUEST
} from 'actions'
import {
  getLastFetchAt
 } from 'selectors'

export const

  attachMinUpdatedAt = store => next => action => {
    if (action.type == FETCH_CURRENT_USER_UPDATES_REQUEST){
      const lastFetchAt = getLastFetchAt(store.getState())
      return next(R.assocPath(["payload", "minUpdatedAt"], lastFetchAt, action))
    }
    return next(action)
  }