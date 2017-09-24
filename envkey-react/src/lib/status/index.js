import {store} from 'init_redux'
import {DISCONNECTED, RECONNECTED, REACTIVATED_BRIEF, REACTIVATED_LONG} from 'actions'
import {promptRestartIfUpdateDownloaded} from 'lib/updates'

let isCheckingConnection = false,
    isCheckingActive = false,
    lastActiveAt,
    lastUserActionAt

const
  isOnline = ()=>{
    return fetch("https://ipv4.icanhazip.com/").then(response => {
      return response.ok
    }).catch(error => {
      return false
    })

  },

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
          diff = time - lastActiveAt

    if (diff > (1000 * 60)){
      store.dispatch({type: REACTIVATED_LONG})
    } else if (diff > (1000 * 10)){
      store.dispatch({type: REACTIVATED_BRIEF})
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

    if (sinceUserAction > (10 * 60)){
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




