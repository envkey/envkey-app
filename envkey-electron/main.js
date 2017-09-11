const
  electron = require('electron'),
  path = require('path'),
  url = require('url'),
  isDev = require('electron-is-dev'),
  {app, BrowserWindow, ipcMain, Menu} = electron

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, stripeWin

function createWindow () {
  // Create the browser window.
  const {width: screenW, height: screenH} = electron.screen.getPrimaryDisplay().workAreaSize
  win = new BrowserWindow({
    width: Math.min(1400, Math.floor(screenW * 0.9)),
    height: Math.min(800, Math.floor(screenH * 0.9)),
    minWidth: 1080,
    minHeight: 540,
    center: true,
    backgroundColor: "#333333",
    title: "EnvKey",
    icon: path.join(__dirname, 'assets/icons/png/64x64.png')
  })

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, (isDev ? 'index.dev.html' : 'index.production.html')),
    protocol: 'file:',
    slashes: true
  }))

  // if (isDev){
    // Open the DevTools.
    win.webContents.openDevTools()
  // }

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
  const type = JSON.parse(decodeURIComponent(json)).type,
        qs = `?data=${json}`,
        h = type == "upgrade_subscription" ? 714 : 365

  stripeWin = new BrowserWindow({
    width: 650,
    height: h,
    parent: win,
    alwaysOnTop: true,
    center: true,
    title: "EnvKey Billing",
    webPreferences: {
      nodeIntegration: false
    }
  })

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

function createMenu(){

  const template = [
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click () { require('electron').shell.openExternal('https://www.envkey.com') }
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    })

    // Edit menu
    template[1].submenu.push(
      {type: 'separator'},
      {
        label: 'Speech',
        submenu: [
          {role: 'startspeaking'},
          {role: 'stopspeaking'}
        ]
      }
    )

    // Window menu
    template[3].submenu = [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ]
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
