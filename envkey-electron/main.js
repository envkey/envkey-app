const
  electron = require('electron'),
  path = require('path'),
  url = require('url'),
  isDev = require('electron-is-dev'),
  {app, BrowserWindow, ipcMain} = electron

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, stripeWin

function createWindow () {
  // Create the browser window.
  const {width: screenW, height: screenH} = electron.screen.getPrimaryDisplay().workAreaSize
  win = new BrowserWindow({width: Math.min(1400, Math.floor(screenW * 0.9)), height: Math.min(800, Math.floor(screenH * 0.9))})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, (isDev ? 'index.dev.html' : 'index.production.html')),
    protocol: 'file:',
    slashes: true
  }))

  if (isDev){
    // Open the DevTools.
    win.webContents.openDevTools()
  }

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
  const qs = `?data=${json}`

  stripeWin = new BrowserWindow({width: 600, height: 400})

  stripeWin.loadURL(url.format({
    pathname: path.join(__dirname, ((isDev ? 'stripe_card.dev.html' : 'stripe_card.production.html') + qs)),
    protocol: 'file:',
    slashes: true
  }))

  stripeWin.on('closed', () => {
    if(win)win.webContents.send("stripeFormClosed")
    stripeWin = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

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
  if (win === null) {
    createWindow()
  }
})

ipcMain.on("openStripeForm", (e, json)=>{
  if(stripeWin)stripeWin.close()
  createStripeWindow(json)
})

ipcMain.on("stripeToken", (e, msg)=>{
  win.webContents.send("stripeToken", msg)

})

ipcMain.on("stripeFormClosed", (e, msg)=>{
  if(stripeWin)stripeWin.close()
  if(win)win.webContents.send("stripeFormClosed", msg)
})

