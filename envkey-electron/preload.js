const electron = require("electron"),
      {clipboard, remote, ipcRenderer, shell} = electron,
      {dialog} = electron.remote,
      updater = remote.require("electron-simple-updater"),
      fs = require('fs'),
      Store = require('electron-store'),
      os = require("os")

window.copy = s => {
  clipboard.writeText(s)
  return true
}

window.ipc = ipcRenderer
window.updater = updater
window.shell = shell
window.dialog = dialog
window.fs = fs
window.electronStore = new Store()

window.platformInfo = {
  platform: os.platform(),
  release: os.release(),
  arch: os.arch()
}

window.appVersion = remote.app.getVersion()
