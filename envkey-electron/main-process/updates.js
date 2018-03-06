const updater = require('electron-simple-updater'),
      {dialog, BrowserWindow, ipcMain} = require('electron'),
      logger = require('electron-log'),
      url = require('url'),
      path = require('path'),
      isDev = require('electron-is-dev')

let versionAvailable,
    versionDownloaded,
    mainWin,
    updaterWin,
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
    openMainUpdater()
  },

  openMainUpdater = ()=> {
    updaterWin = new BrowserWindow({
      width: 500,
      height: 500,
      parent: mainWin,
      center: true,
      title: "EnvKey Auto-Update",
      backgroundColor: "#222",
      modal: true,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "..", 'preload.js')
      }
    })

    updaterWin.params = {versionDownloaded}

    updaterWin.on('page-title-updated', e => e.preventDefault())

    updaterWin.loadURL(url.format({
      pathname: path.join(__dirname, "..", (isDev ? 'main_updater.dev.html' : 'main_updater.production.html')),
      protocol: 'file:',
      slashes: true,
    }))

    if (isDev){
      // Open the DevTools.
      updaterWin.webContents.openDevTools()
    }

    updaterWin.webContents.on('did-finish-load', ()=> {
      updaterWin.webContents.send('version-downloaded', versionAvailable)
    })

    ipcMain.on("main-updater-version-received", ()=>{
      updaterWin.show()
    })

    ipcMain.on('main-updater-closed', ()=> {
      updaterWin.hide()
    })

    ipcMain.on('main-updater-restart', ()=> {
      updaterWin.close()
      updater.quitAndInstall()
    })

    updaterWin.on('hide', ()=> {
      updaterWin = null
    })

    updaterWin.on('close', ()=> {
      updaterWin = null
    })

    mainWin.on('closed', () => {
      mainWin = null
      updaterWin = null
    })
  }

module.exports = {

  listenUpdater: (win)=>{
    mainWin = win

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


