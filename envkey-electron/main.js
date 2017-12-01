const
  electron = require('electron'),
  path = require('path'),
  url = require('url'),
  isDev = require('electron-is-dev'),
  updater = require("electron-simple-updater"),
  createMenu = require('./main-process/create_menu'),
  {listenUpdater} = require('./main-process/updates'),
  {app, BrowserWindow, ipcMain} = electron


// Start auto-update listener
listenUpdater()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, stripeWin

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

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
    if(stripeWin)stripeWin.close()
  })
}

function createStripeWindow(json){
  const {width: screenW, height: screenH} = electron.screen.getPrimaryDisplay().workAreaSize,
        type = JSON.parse(decodeURIComponent(json)).type,
        qs = `?data=${json}`,
        h = type == "upgrade_subscription" ?
          Math.min(850, Math.floor(screenH)) :
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

  if (isDev){
    // Open the DevTools.
    stripeWin.webContents.openDevTools()
  }

  stripeWin.on('closed', () => {
    if(win)win.webContents.send("stripeFormClosed")
    stripeWin = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('ready', createMenu)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win) {

  } else {
    createWindow()
  }
})

ipcMain.on("openStripeForm", (e, json)=>{
  if(stripeWin)stripeWin.close()
  createStripeWindow(json)
})
