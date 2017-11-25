import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import {imagePath, childrenWithProps} from "lib/ui"

export default function(props){
  return h.div(".full-overlay.onboard-overlay", [
    h.div(".divider"),
    h.div(".center-bg", [
      h.div(".logo", [
        h.img({src: imagePath("envkey-logo.svg")})
      ]),

      h.div(".content", childrenWithProps(props.children, props))
    ]),
  ])

}