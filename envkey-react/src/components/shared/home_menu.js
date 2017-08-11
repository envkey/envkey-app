import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { Link } from 'react-router'
import { imagePath } from 'lib/ui'

export default function(){
  return h.div(".full-overlay", [
    h.div(".auth-form.home-menu", [
      h.div(".logo", [
        h.img({src: imagePath("envkey-logo.svg")})
      ]),
      h.div(".content", [
        h.p(".copy", "Welcome to Envkey!"),
        h.div(".menu", [
          h(Link, {to: "/login"}, "Sign In or Sign Up"),
          h(Link, {to: "/accept_invite"}, "Accept Invitation")
        ])
      ])
    ])
  ])
}