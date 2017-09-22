import isOnline from 'is-online'
import {store} from 'init_redux'
import {DISCONNECTED, RECONNECTED} from 'actions'

  let isChecking = false

  const checkConnection = ()=> {
    isChecking = true
    const disconnected = store.getState().disconnected

    // if navigator.onLine is off, don't need to do full isOnline check
    if(!navigator.onLine && !disconnected){
      store.dispatch({type: DISCONNECTED})
      setTimeout(checkConnection, 5000)
      return
    }

    isOnline().then(online => {
      if (online){
        if (disconnected){
          store.dispatch({type: RECONNECTED})
        }
      } else if (!disconnected) {
        store.dispatch({type: DISCONNECTED})
      }
      setTimeout(checkConnection, 5000)
    })
  }

  export const startConnectionWatcher = ()=> {
    if(!isChecking)checkConnection()
  }


