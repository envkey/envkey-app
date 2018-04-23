import "react"
import h from "lib/ui/hyperscript_with_helpers"

export default function(){
  return h.p(".copy.passphrase-copy", [
    h.strong("Your passphrase can't be recovered or reset if you forget it."),
    h.br(),
    "We suggest using a password manager."
  ])
}