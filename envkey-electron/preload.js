const electron = require("electron"),
      {clipboard, remote, ipcRenderer, shell} = electron,
      {dialog} = electron.remote,
      updater = remote.require("electron-simple-updater"),
      fs = require('fs'),
      Store = require('electron-store')

window.copy = s => {
  clipboard.writeText(s)
  return true
}

window.ipc = ipcRenderer

window.updaterVersion = updater.version

window.openExternal = (url)=> shell.openExternal(url)

window.saveFile = (title, defaultPath, data, cb)=> dialog.showSaveDialog({title, defaultPath}, (filename)=>{
  if(!filename)return
  fs.writeFile(filename, data, cb)
})

window.electronStore = new Store()

