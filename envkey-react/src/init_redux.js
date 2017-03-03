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

const devMode = process.env.NODE_ENV == "development" || process.env.BUILD_ENV == "staging",
      sagaMiddleware = createSagaMiddleware(),
      middlewares = [routerMiddleware(browserHistory), sagaMiddleware]

if (devMode) {
  const createLogger = require("redux-logger"),
        logger = createLogger()
  middlewares.push(logger)
}

const reducer = compose(mergePersistedState())(rootReducer),
      localPersistence = compose(filter(["auth","currentOrgSlug"]))(localStorageAdapter(window.localStorage)),
      sessionPersistence = compose(filter(["privkey"]))(localStorageAdapter(window.sessionStorage)),
      enhancerCompose = devMode ? composeWithDevTools : compose,
      enhancer = enhancerCompose(applyMiddleware(...middlewares),
                                 persistState(localPersistence, 'auth'),
                                 persistState(sessionPersistence, 'pgp')),
      store = createStore(reducer, enhancer),
      history = syncHistoryWithStore(browserHistory, store)

// This screwed up localStorage auth
// if (devMode && module.hot) {
//   // Enable Webpack hot module replacement for reducers
//   module.hot.accept('./reducers/root_reducer', () => {
//     const nextReducer = require('./reducers/root_reducer').default
//     store.replaceReducer(nextReducer)
//   })
// }

sagaMiddleware.run(rootSaga)

export {store, history}