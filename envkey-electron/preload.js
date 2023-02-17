const electron = require("electron"),
      {clipboard, remote, ipcRenderer, shell} = electron,
      {dialog} = electron.remote,
      updater = remote.require("electron-simple-updater"),
      fs = require('fs'),
      Store = require('electron-store'),
      path = require('path'),
      os = require('os')

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

window.writeUpgradeArchive = (filename, data, cb)=> {
  const dirParts = [os.homedir(), 'Library', 'Mobile Documents', 'com~apple~CloudDocs','.envkey', 'archives']
  const dir = path.join.apply(null, dirParts)

  let d = ""
  for (let part of dirParts){
    d = path.join(d, part)
    if (!fs.existsSync(d)){
      fs.mkdirSync(d);
    }
  }

  fs.writeFile(path.join(dir, filename), data, cb)
}

window.electronStore = new Store()

