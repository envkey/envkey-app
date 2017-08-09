const {clipboard} = require("electron")

window.copy = s => {
  clipboard.writeText(s)
  return true
}