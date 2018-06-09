import { combineReducers } from 'redux'
import * as coreReducers from 'envkey-client-core/reducers'
import * as billingReducers from './ui_reducers'
import * as uiReducers from './ui_reducers'
import * as envReducers from './env_reducers'
import * as socketReducers from './socket_reducers'
import { routerReducer } from 'react-router-redux'

export default combineReducers({
  ...coreReducers,
  ...billingReducers,
  ...uiReducers,
  ...socketReducers,
  routing: routerReducer
})