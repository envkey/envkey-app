const electron = require("electron"),
      {clipboard, remote, ipcRenderer, shell} = electron,
      {dialog} = electron.remote,
      updater = remote.require("electron-simple-updater"),
      fs = require('fs'),
      Conf = require('conf'),
      os = require("os"),
      path = require("path")


window.copy = s => {
  clipboard.writeText(s)
  return true
}

window.ipc = ipcRenderer
window.updater = updater
window.shell = shell
window.dialog = dialog
window.fs = fs
window.configStore = new Conf({
  cwd: path.join(os.homedir(), ".envkey"),
  encryptionKey: "envkey-config-obfuscator"
})

window.platformInfo = {
  platform: os.platform(),
  release: os.release(),
  arch: os.arch()
}

window.appVersion = remote.app.getVersion()
