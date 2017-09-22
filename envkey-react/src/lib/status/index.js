import isOnline from 'is-online'
import {store} from 'init_redux'
import {DISCONNECTED, RECONNECTED, REACTIVATED_BRIEF, REACTIVATED_LONG} from 'actions'

  let isCheckingConnection = false,
      isCheckingActive = false,
      lastActive

  const
    checkConnection = ()=> {
      isCheckingConnection = true
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
    },

    checkReactivated = ()=> {
      const time = Date.now(),
            diff = time - lastActive

      if (diff > (1000 * 60)){
        store.dispatch({type: REACTIVATED_LONG})
      } else if (diff > (1000 * 10)){
        store.dispatch({type: REACTIVATED_BRIEF})
      }

      lastActive = time
      setTimeout(checkReactivated, 4000)
    }

  export const
    startConnectionWatcher = ()=> {
      if(!isCheckingConnection)checkConnection()
    },

    startReactivatedWatcher = ()=> {
      if (!lastActive){
        lastActive = Date.now()
        checkReactivated()
      }
    }


