import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import {
  getInvitedBy,
  getEnvAccessGranted
} from 'selectors'

const AwaitingAccess = ({envAccessGranted, invitedBy})=>{

  const invitedByName = ()=> invitedBy ? [invitedBy.firstName, invitedBy.lastName].join(" ") : ""

  return h.div(".viewport-overlay", {
    className: (envAccessGranted ? "hide" : "")
  }, [
    h.div(".awaiting-access", [
      h.h3("Awaiting config access..."),

      h.p([
        "Because Envkey uses end-to-end encryption, ",
        h.strong(".invited-by", invitedByName()),
        " still needs to grant you access with your newly generated public key."
      ]),

      h.p([
        "If he or she is currently logged in to the Envkey client, this will happen ",
        h.strong("automatically"),
        " within the ",
        h.strong("next 20 seconds."),
      ]),

      h.p([
        "If not, we've already ",
        h.strong("sent an email "),
        " asking them to log in and grant you access."
      ])
    ])
  ])
}

const mapStateToProps = (state)=> {
  return {
    envAccessGranted: getEnvAccessGranted(state),
    invitedBy: getInvitedBy(state)
  }
}

export default connect(mapStateToProps)(AwaitingAccess)



