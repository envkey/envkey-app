import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

export default function({envAccessGranted, invitedBy}){

  const invitedByName = ()=> [invitedBy.firstName, invitedBy.lastName].join(" "),

  return h.div(".viewport-overlay", {
    className: (envAccessGranted ? "" : "hide")
  }, [
    h.div(".awaiting-access", [
      h.span("Awaiting Environment Access"),

      h.p([
        "Because Envkey uses end-to-end encryption for your team's config, ",
        h.strong(invitedByName()),
        "still needs to grant you access using your newly generated public key."
      ]),

      h.p([
        "If he or she is currently logged in to the Envkey client, this will happen ",
        h.strong("automatically"),
        "within the ",
        h.strong("next 30 seconds"),
      ]),

      h.p([
        "If not, we've already sent them an email asking them to log on and grant you access. If you're in the same room, feel free to pelt them with paperclips or other suitable projectiles until they comply."
      ])
    ])

  ])

}