import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

export default function({
  firstName,
  lastName,
  email,
  pubkey
}){

  const renderPubkey = ()=>{
    if (pubkey){
      return h.fieldset(".pubkey", [
        h.label("Public Key"),

        h.p(
          pubkey.split(/\n/).map(line => h.span([line, h.br()]))
        )
      ])
    }
  }

  return h.div(".details.user-details", [
    h.fieldset(".first-name", [
      h.label("First Name"),
      h.span(firstName)
    ]),

    h.fieldset(".last-name", [
      h.label("Last Name"),
      h.span(lastName)
    ]),

    h.fieldset(".email", [
      h.label("Email"),
      h.span(email)
    ])

    // renderPubkey()
  ])

}
