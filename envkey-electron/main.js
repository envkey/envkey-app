const
  electron = require('electron'),
  path = require('path'),
  url = require('url'),
  isDev = require('electron-is-dev'),
  updater = require("electron-simple-updater"),
  createMenu = require('./main-process/create_menu'),
  {listenUpdater} = require('./main-process/updates'),
  {app, BrowserWindow, ipcMain, dialog} = electron

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, stripeWin, updaterWin
let appReady = false,
    forceClose = false

if (isDev){
  // Open the DevTools.
  const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer')
  installExtension(REACT_DEVELOPER_TOOLS)
  installExtension(REDUX_DEVTOOLS)
}

function onAppReady(){
  appReady = true
  createWindow()
  createMenu()
}

function createWindow () {
  // Create the browser window.
  const {width: screenW, height: screenH} = electron.screen.getPrimaryDisplay().workAreaSize

  win = new BrowserWindow({
    width: Math.min(1400, Math.floor(screenW)),
    height: Math.min(800, Math.floor(screenH)),
    minWidth: 1180,
    minHeight: 640,
    center: true,
    backgroundColor: "#333333",
    title: "EnvKey " + updater.version,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png')
  })

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, (isDev ? 'index.dev.html' : 'index.production.html')),
    protocol: 'file:',
    slashes: true
  }))

  win.on('page-title-updated', e => e.preventDefault())

  win.on('close', e => {
    if (forceClose) return
    e.preventDefault()
    win.webContents.executeJavaScript("isUpdatingAnyEnv()").then(res => {
      if (res){
        dialog.showMessageBox({
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Confirm',
            message: 'EnvKey is still encrypting and syncing. Your updates may not be committed. Are you sure you want to quit?'
        }, function (i) {
            if (i === 0) { // Runs the following if 'Yes' is clicked
              forceClose = true
              win.close()
            }
        })
      } else {
        forceClose = true
        win.close()
      }
    }).catch(err => {
      forceClose = true
      win.close()
    })
  })

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding   element.
    win = null
    if(stripeWin)stripeWin.close()
  })

  listenUpdater(win)
}

function createStripeWindow(json){
  const {width: screenW, height: screenH} = electron.screen.getPrimaryDisplay().workAreaSize,
        type = JSON.parse(decodeURIComponent(json)).type,
        qs = `?data=${json}`,
        h = type == "upgrade_subscription" ?
          Math.min(825, Math.floor(screenH)) :
          365

  stripeWin = new BrowserWindow({
    width: 650,
    height: h,
    parent: win,
    alwaysOnTop: true,
    center: true,
    title: "EnvKey " + updater.version + " Billing",
    webPreferences: {
      nodeIntegration: false
    }
  })

  stripeWin.on('page-title-updated', e => e.preventDefault())

  stripeWin.loadURL(url.format({
    pathname: path.join(__dirname, (isDev ? 'stripe_card.dev.html' : 'stripe_card.production.html')),
    protocol: 'file:',
    slashes: true,
    search: qs
  }))

  stripeWin.on('closed', () => {
    if(win)win.webContents.send("stripeFormClosed")
    stripeWin = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', onAppReady)

app.on('before-quit', ()=>{
  forceClose = true
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win) {

  } else if (appReady) {
    createWindow()
  }
})

ipcMain.on("openStripeForm", (e, json)=>{
  if(stripeWin)stripeWin.close()
  createStripeWindow(json)
})
