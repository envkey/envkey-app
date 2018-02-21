const electron = require("electron"),
      {clipboard, remote, ipcRenderer, shell} = electron,
      updater = remote.require("electron-simple-updater"),
      os = require("os")

window.copy = s => {
  clipboard.writeText(s)
  return true
}

window.ipc = ipcRenderer
window.updater = updater
window.shell = shell

window.platformInfo = {
  platform: os.platform(),
  release: os.release(),
  arch: os.arch()
}

window.appVersion = remote.app.getVersion()