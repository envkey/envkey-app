import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import Spinner from "components/shared/spinner"
import copy from 'lib/ui/copy'

export default class InviteUserOverlay extends React.Component {
  constructor(props){
    super(props)
    this.state = { copied: false }
  }

  _onCopy(){
    const {identityHash, encryptionKey} = this.props.generatedInviteLink,
          encryptionToken = [identityHash, encryptionKey].join("_"),
          res = copy(encryptionToken, {message: "Copy the text below with #{key}"})
    if (res){
      this.setState({copied: true})
    }
  }

  render(){
    return h.div(".invite-user-overlay", [
      h.div(".content", [this._renderContent()])
    ])
  }

  _renderContent(){
    if (this.props.invitingUser){
      return this._renderInvitingUser()
    } else if (this.props.generatedInviteLink){
      return this._renderGeneratedInviteLink()
    }
  }

  _renderInvitingUser(){
    const {email, firstName, lastName} = this.props.invitingUser

    return h.div([
      h.h2("Generating Secure Invitation"),
      h.p(".invited-user", `${firstName} ${lastName} <${email}>`),
      h.div(".loader", [
        h(Spinner)
      ])
    ])
  }

  _renderInvitedCopy(firstName){
    if (this.props.isDemo){
      return h.div(".copy", [
        h.p([h.strong("If this weren't a demo, "), `an EnvKey invitation would be sent to ${firstName} by email.`]),
        h.p([
          `You'd also need to send ${firstName} the following `,
          h.strong(".token", "Encryption Token"),
          " by any reasonably private channel: "
        ])
      ])
    } else {
      return h.div(".copy", [
        h.p(`An EnvKey invitation has been sent to ${firstName} by email.`),
        h.p([
          `You also need to send ${firstName} the following `,
          h.strong(".token", "Encryption Token"),
          " by any reasonably private channel: "
        ])
      ])
    }
  }

  _renderGeneratedInviteLink(){
    const {identityHash, encryptionKey, user: {email, firstName, lastName}} = this.props.generatedInviteLink,
          encryptionToken = [identityHash, encryptionKey].join("_")

    return h.div([
      h.h2("Invitation Generated"),
      h.p(".invited-user", `${firstName} ${lastName} <${email}>`),
      this._renderInvitedCopy(firstName),
      h.div(".encryption-token", [
        h.span(encryptionToken.slice(0,40) + "…"),
        (this.state.copied ? h.small("Copied.") : null),
        h.button(".copy-btn", {onClick: ::this._onCopy}, "Copy")
      ]),

      h.div(".copy.secondary", [
        h.h3("Important"),
        h.div(".divider"),
        h.ul([
          h.li([
            "Sending the ",
            "Encryption Token",
            " over a ",
            h.strong("non-email channel"),
            " (like Slack, Twitter, Skype, or Facebook) is ideal since it provides multi-factor security."
          ]),

          h.li([
            "This invitation can only be redeemed ",
            h.strong("once"),
            ". It will expire in ",
            h.strong("24 hours"),
            "."
          ]),

          h.li([
            "EnvKey ",
            h.strong("cannot retrieve"),
            " your ",
            "Encryption Token",
            ", but you can always generate a new invitation."
          ])
        ])
      ]),

      h.button(".button", {onClick: this.props.closeInvite}, "Done")
    ])
  }

}

