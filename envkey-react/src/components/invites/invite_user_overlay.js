import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import Spinner from "components/shared/spinner"

export default function({invitingUser, generatedInviteLink, closeInvite}){

  const

    renderInvitingUser = ()=>{
      const {email, firstName, lastName} = invitingUser

      return h.div([
        h.h2("Generating secure invitation for:"),
        h.h2(`${firstName} ${lastName} <${email}>`),
        h.div(".loader", [
          h(Spinner)
        ])
      ])
    },

    renderGeneratedInviteLink = ()=>{
      const {identityHash, passphrase, user: {email, firstName, lastName}} = generatedInviteLink,
            inviteCode = [identityHash, passphrase].join("-")

      return h.div([
        h.h2("Invitation generated."),
        h.div(".copy", [
          h.p(`An invitation for ${firstName} ${lastName} has been sent to ${email}.`),
          h.p([
            `You also need to send ${firstName} the following `,
            h.strong("Encryption Code"),
            " by any private channel: "
          ]),
          h.div(".invite-code", [
            h.span(inviteCode)
          ]),

          h.p([
            "Sending the ",
            h.strong("Encryption Code"),
            " over a non-email channel (like Slack or another messaging tool) is ideal since it provides multi-factor security, ",
            "but email is ok in a pinch."
          ]),

          h.p("This invitation can only be redeemed once. It will expire in 24 hours."),

          h.p([
            "Envkey cannot retrieve your ",
            h.strong("Encryption Code"),
            ", but you can always generate a new invitation."
          ]),
        ]),

        h.button(".button", {onClick: closeInvite}, "Done")
      ])
    },

    renderContent = ()=> {
      if (invitingUser){
        return renderInvitingUser()
      } else if (generatedInviteLink){
        return renderGeneratedInviteLink()
      }
    }

  return h.div(".invite-user-overlay", [
    renderContent()
  ])
}