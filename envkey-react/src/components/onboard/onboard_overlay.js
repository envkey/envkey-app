import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import {imagePath, childrenWithProps} from "lib/ui"

export default function(props){

  const {currentUser: {firstName}, children} = props

  return h.div(".full-overlay.onboard-overlay", [
    h.div(".divider.divider"),
    h.div(".center-bg", [
      h.div(".logo", [
        h.img({src: imagePath("envkey-logo.svg")})
      ]),

      h.h1(".welcome", ["Welcome, ", h.em(firstName + ".")]),

      h.p("You’re a few steps away from simple, secure, bug-free config for your team and your infrastructure."),

      h.div(".content", childrenWithProps(children, props))
    ]),
  ])

}