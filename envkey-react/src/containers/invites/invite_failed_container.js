import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { Link } from 'react-router'
import { connect } from 'react-redux'
import {OnboardOverlay} from 'components/onboard'
import {resetSession} from 'actions'
import {imagePath} from 'lib/ui'

class InviteFailed extends React.Component {

  render(){
    return h(OnboardOverlay, [
      h.div([
        h.h1(["Invitation", h.em(" Failed")]),
        h.div(".onboard-auth-form.accept-invite-form", [
          this._renderContent(),
          this._renderBackLink()
        ])
      ])
    ])
  }

  _renderContent(){
    return h.div(".content", [
      h.p("Your invitation to this organization either expired, was revoked, or could not be verified. EnvKey invitations expire after 24 hours and can only be loaded once."),
      h.p("To gain access, ask an admin of your organization to re-invite you. If you're still having trouble, please contact support: support@envkey.com")
    ])
  }

  _renderBackLink(){
    return h(Link, {className: "back-link", to: "/home", onClick: ::this.props.onReset}, [
      h.span(".img", "←"),
      h.span("Back To Home")
    ])
  }

}

const mapStateToProps = state => {
  return {
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onReset: ()=> dispatch(resetSession())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteFailed)

