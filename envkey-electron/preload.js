const electron = require("electron"),
      {clipboard, remote, ipcRenderer, shell} = electron

window.copy = s => {
  clipboard.writeText(s)
  return true
}

window.ipc = ipcRenderer
window.shell = shell
