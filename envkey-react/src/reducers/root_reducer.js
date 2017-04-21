import { combineReducers } from 'redux'
import * as authReducers from './auth_reducers'
import * as orgReducers from './org_reducers'
import * as uiReducers from './ui_reducers'
import * as envReducers from './env_reducers'
import * as socketReducers from './socket_reducers'
import * as cryptoReducers from './crypto_reducers'
import * as importReducers from './import_reducers'
import objectReducers from './object_reducers'
import { routerReducer } from 'react-router-redux'

export default combineReducers({
  ...authReducers,
  ...orgReducers,
  ...objectReducers,
  ...uiReducers,
  ...envReducers,
  ...socketReducers,
  ...cryptoReducers,
  ...importReducers,
  routing: routerReducer
})