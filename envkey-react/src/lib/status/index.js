import {store} from 'init_redux'
import {DISCONNECTED, REACTIVATED_BRIEF, REACTIVATED_LONG} from 'actions'
import {promptRestartIfUpdateDownloaded} from 'lib/updates'

let isCheckingConnection = false,
    isCheckingActive = false,
    lastActiveAt,
    lastUserActionAt

const
  isOnline = (retries)=>{
    return fetch("https://ipv4.icanhazip.com/").then(response => {
      return response.ok
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
  },

  onUserAction = ()=> {
    lastUserActionAt = Date.now()
  },

  onWindowFocus = ()=>{
    // If it's been at least a minute since any user action and an update is available, prompt for restart
    const time = Date.now(),
          sinceUserAction = time - lastUserActionAt

    console.log("Window focused")
    console.log("Since user action: ", sinceUserAction)

    if (sinceUserAction > (1000 * 60)){
      console.log("prompting for restart if update downloaded")
      promptRestartIfUpdateDownloaded()
    }

    lastUserActionAt = Date.now()
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
  },

  startWindowFocusWatcher = ()=>{
    document.body.addEventListener('click', onUserAction)
    document.body.addEventListener('mousemove', onUserAction)
    document.body.addEventListener('keydown', onUserAction)

    window.addEventListener('focus', onWindowFocus)
  }




