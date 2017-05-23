import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

export default function({show}){

  return h.div(".register-prompt", {className: (show ? " show" : "")}, [
    h.div(".header", [
      h.h4("Like what you see?")
    ]),

    h.div(".body", [

      h.div(".copy", [
        h.p([
          "Start using Envkey to improve security and simplify ops. ",
          "Integration takes minutes."
        ])
      ]),

      h.a(".button.cta-button", {
        href: "https://dashboard.envkey.com/signup"
      }, [
        h.span("Create A Free Account")
      ]),

      h.div(".contact", [

      ])
    ])
  ])

}