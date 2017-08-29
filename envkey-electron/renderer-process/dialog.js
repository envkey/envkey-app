const {dialog} = require('electron').remote

window.nativeAlert = (msg, title, cb) => {
  dialog.showMessageBox({
    type: "none",
    buttons: ["Ok"],
    message: msg,
    title: title
  }, cb)
}