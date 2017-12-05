import {store} from 'init_redux'
import {DISCONNECTED, REACTIVATED_BRIEF, REACTIVATED_LONG} from 'actions'

let isCheckingConnection = false,
    isCheckingActive = false,
    lastActiveAt,
    lastUserActionAt

const
  isOnline = (retries)=>{
    return fetch("http://www.msftncsi.com/ncsi.txt", {mode: "no-cors"}).then(response => {
      return true
    }).catch(error => {
      if (!retries || retries < 2){
        return isOnline((retries || 0) + 1)
      }
      return false
    })
  },

  checkConnection = ()=> {
    isCheckingConnection = true
    const disconnected = store.getState().disconnected == true

    // if navigator.onLine is off, don't need to do full isOnline check
    if(!navigator.onLine && !disconnected){
      console.log("dispatch DISCONNECTED - navigator")
      store.dispatch({type: DISCONNECTED})
      setTimeout(checkConnection, 5000)
      return
    }

    isOnline().then(online => {
      if (online){
        if (disconnected){
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



