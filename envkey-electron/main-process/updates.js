const updater = require('electron-simple-updater'),
      {dialog, BrowserWindow} = require('electron'),
      logger = require('electron-log')

let versionAvailable,
    versionDownloaded,
    checkingUpdates = false

logger.transports.file.level = 'info'

// Auto-update
updater.init({logger, autoDownload: false, checkUpdateOnStart: false})

const
  onUpdateDownloaded = ()=>{
    logger.info("Update downloaded.")
    versionDownloaded = versionAvailable
    promptRestart()
  },

  onUpdateAvailable = meta =>{
    logger.info("Update available.")
    if(meta.version == versionAvailable)return
    versionAvailable = meta.version
    updater.downloadUpdate()
  },

  promptRestart = ()=> {
    let choice = dialog.showMessageBox({
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: `EnvKey has auto-updated to v${versionDownloaded}. Do you want to restart with the latest version?`
    })

    if(choice === 0){
      updater.quitAndInstall()
    }
  }

module.exports = {

  listenUpdater: ()=>{
    if(checkingUpdates)return

    updater.on('update-available', onUpdateAvailable)
    updater.on('update-downloaded', onUpdateDownloaded)
    updater.on('error', err => logger.error(err))

    // Check for updates every 10 minutes
    setInterval(()=> updater.checkForUpdates(), 1000 * 60 * 10)

    updater.checkForUpdates()

    checkingUpdates = true
  }
}