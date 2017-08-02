import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import Spinner from "components/shared/spinner"

export default function({invitingUser, generatedInviteLink, closeInvite}){

  const

    renderInvitingUser = ()=>{
      const {email, firstName, lastName} = invitingUser

      return h.div([
        h.h2("Generating secure invite link for:"),
        h.h2(`${firstName} ${lastName} <${email}>`),
        h.div(".loader", [
          h(Spinner)
        ])
      ])
    },

    renderGeneratedInviteLink = ()=>{
      const {identityHash, passphrase, user: {email, firstName, lastName}} = generatedInviteLink,
            link = [process.env.HOST, "accept_invite", identityHash, passphrase].join("/")

      return h.div([
        h.h2("Invite link generated."),
        h.div(".copy", [
          h.p(`Copy the link below and send it to ${firstName} ${lastName} by any private channel (email, Slack, etc.)`),
          h.p(`${firstName} will have to verify that his or her email address is ${email} to gain access.`),
          h.p("This link can only be opened once. It will expire in 24 hours.")
        ]),
        h.div(".invite-link", [
          h.span(".link", link)
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