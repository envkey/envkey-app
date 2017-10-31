import isElectron from 'is-electron'

let currentVersion,
    versionAvailable,
    versionDownloaded,
    rejectedVersion

const
  onUpdateDownloaded = ()=>{
    console.log("Update downloaded.")
    versionDownloaded = versionAvailable
    setTimeout(promptRestart, 1000)
  },

  onUpdateAvailable = meta =>{
    console.log("Update available.")
    console.log(meta)

    if(meta.version == versionAvailable)return

    versionAvailable = meta.version
    updater.downloadUpdate()
  }

export const

  checkForUpdates = ()=>{
    if (!updater)return
    console.log("Checking for updates...")
    updater.checkForUpdates()
  },

  promptRestart = ()=> {
    if (window.confirm(`EnvKey has auto-updated to v${versionDownloaded}. Do you want to restart with the latest version?`)) {
      window.installUpdate()
    } else {
      rejectedVersion = versionDownloaded
    }
  },

  promptRestartIfUpdateDownloaded = ()=>{
    if(!window.updater || !versionDownloaded || (rejectedVersion && rejectedVersion == versionDownloaded))return
    promptRestart()
  },

  listenUpdater = ()=>{
    if (!window.updater)return

    updater.on('update-downloaded', onUpdateDownloaded)
    updater.on('update-available', onUpdateAvailable)

    // Check for updates every 10 minutes
    setInterval(checkForUpdates, 1000 * 60 * 10)

    checkForUpdates()
  }