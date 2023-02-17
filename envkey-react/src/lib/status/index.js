import {store} from 'init_redux'
import {getIsUpdatingAnyEnv} from 'selectors'
import {DISCONNECTED, REACTIVATED_BRIEF, REACTIVATED_LONG, commitSanitizedActionLog} from 'actions'
import isElectron from 'is-electron'
import R from 'ramda'

window.isUpdatingAnyEnv = ()=> {
  return getIsUpdatingAnyEnv(store.getState())
}

let isCheckingConnection = false,
    isCheckingActive = false,
    isWatchingSessionLogs = false,
    lastActiveAt,
    lastUserActionAt

const
  isOnline = (retries)=>{
    // if (process.env.NODE_ENV == 'development'){
    //   return Promise.resolve(true)
    // }

    const urls = isElectron() ?
      ["http://www.msftconnecttest.com/connecttest.txt", "https://health.aws.amazon.com/health/status"] :
      ["https://icanhazip.com/"]

    return Promise.all(
      urls.map(
        url => fetch((url + "?" + Date.now().toString()), {
          mode: "no-cors",
          cache: 'no-store',
          method: 'HEAD'
        }).then(response => {
          return true;
        }).catch(error => {
          return false;
        })
      )
    ).then(res => {
      if (R.any(Boolean, res)){
        return true;
      } else {
        if (!retries || retries < 2){
          return isOnline((retries || 0) + 1);
        }
        return false;
      }
    })
  },

  checkConnection = ()=> {
    // if (process.env.NODE_ENV == 'development'){
    //   return
    // }

    isCheckingConnection = true
    const disconnected = store.getState().disconnected == true

    // if navigator.onLine is off, don't need to do full isOnline check
    if(!navigator.onLine){
      if (!disconnected){
        console.log("dispatch DISCONNECTED - navigator")
        store.dispatch({type: DISCONNECTED})
      }

      setTimeout(checkConnection, 5000)
      return
    }

    isOnline().then(online => {
      if (online){
        if (disconnected){
          console.log("status check connection reload")
          window.location.reload()
        }
      } else if (!disconnected) {
        console.log("dispatch DISCONNECTED - isOnline")
        store.dispatch({type: DISCONNECTED})
      }
      setTimeout(checkConnection, 5000)
    })
  },

  reactivateIfConnected = type => {
    isOnline().then(online => {
      if (online){
        store.dispatch({type})
      } else {
        console.log("dispatch DISCONNECTED - reactivateIfConnected")
        store.dispatch({type: DISCONNECTED})
      }
    })
  },

  checkReactivated = ()=> {
    const disconnected = store.getState().disconnected == true,
          time = Date.now(),
          diff = time - lastActiveAt

    if (!disconnected){
      if (diff > (1000 * 60)){
        console.log("REACTIVATED_LONG if connected")
        reactivateIfConnected(REACTIVATED_LONG)
      } else if (diff > (1000 * 10)){
        console.log("REACTIVATED_BRIEF if connected")
        reactivateIfConnected(REACTIVATED_BRIEF)
      }
    }

    lastActiveAt = time
    setTimeout(checkReactivated, 4000)
  }


export const

  startConnectionWatcher = ()=> {
    if(!isCheckingConnection)checkConnection()
  },

  startReactivatedWatcher = ()=> {
    if (!lastActiveAt){
      lastActiveAt = Date.now()
      checkReactivated()
    }
  }



