import R from 'ramda'
import isElectron from 'is-electron'

export const

  attachLoggingParams = store => next => action => {
    if (!action.type){
      debugger
    }
    if (action.type.endsWith("_REQUEST")){
      const params = (isElectron() ? {
                       client_name: "envkey-app",
                       client_os: window.platformInfo.platform,
                       client_arch: window.platformInfo.arch,
                       client_os_release: window.platformInfo.release,
                       client_version: window.appVersion
                     } : {
                       client_name: "envkey-web"
                     }),
            payload = {...params, ...(action.payload || {})}

      return next({...action, payload})
    }

    return next(action)
  }