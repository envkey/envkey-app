import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import Spinner from "./spinner"

export default function({isDecrypting}){
  return h.div(".viewport-overlay", {
    className: (isDecrypting ? "" : "hide")
  }, [
    h.div(".decrypt-loader", [
      h.span(".label", "Decrypting config..."),
      h(Spinner)
    ])
  ])
}