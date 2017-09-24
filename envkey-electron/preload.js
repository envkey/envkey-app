const electron = require("electron"),
      {clipboard, remote, ipcRenderer} = electron,
      updater = remote.require("electron-simple-updater")

window.copy = s => {
  clipboard.writeText(s)
  return true
}

window.ipc = ipcRenderer

window.updater = updater