import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import {twitterShortTs} from 'lib/utils/date'

export default function({
  firstName,
  lastName,
  email,
  pubkey,
  accessStatus: {status, timestamp}
}){

  const
    renderPubkey = ()=>{
      if (pubkey){
        return h.fieldset(".pubkey", [
          h.label("Public Key"),

          h.p(
            pubkey.split(/\n/).map(line => h.span([line, h.br()]))
          )
        ])
      }
    },

    renderAccessStatus = ()=> {
      const classStr = ".status",
            ts =  h.small([h.i(" ・ "), twitterShortTs(timestamp)])

      if (status == "owner"){
        return h.span(classStr, [
          "Org  ",
          h.em(".granted", "owner"),
          ts
        ])
      } else if (status == "confirmed"){
        return h.span(classStr, [
          "Invite ",
          h.em(".granted", "accepted"),
          ts
        ])
      } else if (status == "invited"){
        return h.span(classStr, {className: "invite-pending"}, [
          "Invite ",
          h.em(".pending", "pending"),
          ts
        ])
      } else if (status == "expired"){
        return h.span(classStr, [
          "Invite ",
          h.em(".expired", "expired "),
          ts
        ])
      } else if (status == "revoked"){
        return h.span(classStr, [
          "Invite ",
          h.em(".revoked", "revoked "),
          ts
        ])
      } else if (status == "failed"){
        return h.span(classStr, [
          "Invite ",
          h.em(".failed", "failed "),
          ts
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
    ]),

    h.fieldset(".status", [
      h.label("Status"),
      renderAccessStatus()
    ])

    // renderPubkey()
  ])

}
