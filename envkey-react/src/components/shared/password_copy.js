import "react"
import h from "lib/ui/hyperscript_with_helpers"

export default function(){
  return h.p(".copy.passphrase-copy", [
    "*",
    "Your ",
    h.strong("master encryption passphrase"),
    " is never sent to the server, so it can't be recovered or reset if you forget. We suggest using a password manager."
  ])
}