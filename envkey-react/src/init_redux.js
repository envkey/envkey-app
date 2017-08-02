import { browserHistory } from 'react-router'
import { compose, createStore, combineReducers, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import createLogger from 'redux-logger'
import persistState, {mergePersistedState} from 'redux-localstorage'
import localStorageAdapter from 'redux-localstorage/lib/adapters/localStorage'
import sessionStorageAdapter from 'redux-localstorage/lib/adapters/sessionStorage'
import filter from 'redux-localstorage-filter'
import { routerMiddleware, syncHistoryWithStore } from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'
import rootReducer from './reducers/root_reducer'
import rootSaga from './sagas/root_saga'
import appMiddlewares from 'middleware'

const devMode = process.env.NODE_ENV == "development" || process.env.BUILD_ENV == "staging",
      sagaMiddleware = createSagaMiddleware(),
      middlewares = [
        ...appMiddlewares,
        routerMiddleware(browserHistory),
        sagaMiddleware
      ]

if (devMode) {
  const createLogger = require("redux-logger"),
        logger = createLogger()
  middlewares.push(logger)
}

const reducer = compose(mergePersistedState())(rootReducer),

      localPersistence = compose(filter([
        "auth",
        "currentOrgSlug"
      ]))(localStorageAdapter(window.localStorage)),

      sessionPersistence = compose(filter(["privkey"]))(sessionStorageAdapter(window.sessionStorage)),

      enhancerCompose = devMode ? composeWithDevTools : compose,

      enhancer = enhancerCompose(
        applyMiddleware(...middlewares),
        persistState(localPersistence, 'session'),
        persistState(sessionPersistence, 'pgp')
      ),

      store = createStore(reducer, enhancer),

      history = syncHistoryWithStore(browserHistory, store)

sagaMiddleware.run(rootSaga)

export {store, history}