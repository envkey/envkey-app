const electron = require("electron"),
      {clipboard, remote, ipcRenderer, shell} = electron,
      {dialog} = electron.remote,
      updater = remote.require("electron-simple-updater"),
      fs = require('fs')

window.copy = s => {
  clipboard.writeText(s)
  return true
}

window.ipc = ipcRenderer
window.updater = updater
window.shell = shell
window.dialog = dialog
window.fs = fs
