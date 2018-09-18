import R from 'ramda'
import { browserHistory, hashHistory } from 'react-router'
import { compose, createStore, combineReducers, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import persistState, {mergePersistedState} from 'redux-localstorage'
import localStorageAdapter from 'redux-localstorage/lib/adapters/localStorage'
import sessionStorageAdapter from 'redux-localstorage/lib/adapters/sessionStorage'
import filter from 'redux-localstorage-filter'
import { routerMiddleware, syncHistoryWithStore } from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'
import rootReducer from './reducers/root_reducer'
import rootSaga from './sagas/root_saga'
import appMiddlewares from 'middleware'
import isElectron from 'is-electron'
import createLogger from 'redux-logger'
import {LOCAL_PERSISTENCE_AUTH_KEYS, SESSION_PERSISTENCE_AUTH_KEYS} from 'envkey-client-core/dist/constants'
import {configStorageAdapter} from 'lib/storage'

const
  devMode = process.env.NODE_ENV == "development" || process.env.BUILD_ENV == "staging",

  debugBuild = process.env.DEBUG_BUILD,

  historyType = isElectron() ? hashHistory : browserHistory,

  sagaMiddleware = createSagaMiddleware(),

  loggerOpts = {
    diff: (devMode || debugBuild),
    level: {
      prevState: (devMode || debugBuild) ? "info" : false,
      nextState: (devMode || debugBuild) ? "info" : false,
      action: "info",
      error: "info",
      diff: (devMode || debugBuild)
    }
  }

if (!devMode && !debugBuild){
  loggerOpts.actionTransformer = action => {
    const props = ["type", "error"]
    if (action.error) props.push("payload")
    return R.pick(props, action)
  }
}

const
  logger = createLogger(loggerOpts),

  middlewares = [
    ...appMiddlewares,
    routerMiddleware(historyType),
    sagaMiddleware,
    logger
  ],

  reducer = compose(mergePersistedState())(rootReducer),

  storageAdapter = isElectron() ? configStorageAdapter : localStorageAdapter(window.localStorage),

  accountsPersistence = compose(filter(["accounts", "accountPrivkeys"]))(storageAdapter),

  sessionPersistence = compose(filter(["auth", "privkey", "currentOrgSlug"]))(storageAdapter),

  enhancerCompose = devMode ? composeWithDevTools : compose,

  enhancer =  enhancerCompose(
    applyMiddleware(...middlewares),
    persistState(accountsPersistence, 'accounts'),
    persistState(sessionPersistence, 'ui-session')
  ),

  store = createStore(reducer, enhancer),

  history = syncHistoryWithStore(historyType, store)


sagaMiddleware.run(rootSaga)

export {store, history}