import isElectron from 'is-electron'

let currentVersion,
    versionAvailable,
    versionDownloaded,
    rejectedVersion

const
  onUpdateDownloaded = ()=>{
    console.log("Update downloaded.")
    versionDownloaded = versionAvailable
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

  promptRestartIfUpdateDownloaded = ()=>{
    if(!updater || !versionDownloaded)return

    if (window.confirm(`EnvKey has auto-updated to v${versionDownloaded}. Do you want to restart with the latest version?`)) {
      updater.quitAndInstall()
    } else {
      rejectedVersion = versionDownloaded
    }
  },

  listenUpdater = ()=>{
    if (!updater)return

    updater.on('update-downloaded', onUpdateDownloaded)
    updater.on('update-available', onUpdateAvailable)

    // Check for updates every 10 minutes
    // setInterval(checkForUpdates, 1000 * 60 * 10)

    setInterval(checkForUpdates, 10 * 60 * 10)
  }