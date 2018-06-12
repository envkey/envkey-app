import { combineReducers } from 'redux'
import coreReducers from 'envkey-client-core/dist/reducers'
import * as billingReducers from './billing_reducers'
import * as uiReducers from './ui_reducers'
import * as socketReducers from './socket_reducers'
import { routerReducer } from 'react-router-redux'

export default combineReducers({
  ...coreReducers,
  ...billingReducers,
  ...uiReducers,
  ...socketReducers,
  routing: routerReducer
})