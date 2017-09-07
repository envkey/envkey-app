import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { Link } from 'react-router'
import { connect } from 'react-redux'
import {getActiveOrgs} from 'selectors'
import {onLoad} from 'actions'
import {imagePath} from 'lib/ui'

class InviteFailed extends React.Component {

  render(){
    return h.div(".full-overlay", [
      h.div(".auth-form.invite-failed", [
        h.div(".logo", [
          h.img({src: imagePath("envkey-logo.svg")})
        ]),
        h.div(".content", [
          h.p("Your invitation to this organization either expired, was revoked, or could not be verified. EnvKey invitations expire after 24 hours and can only be loaded once."),
          h.p("To gain access, ask an admin of your organization to re-invite you. If you're still having trouble, please contact support: support@envkey.com"),
          h.div(".actions", this._renderActions())
        ])
      ])
    ])
  }

  _renderActions(){
    const actions = [h(Link, {to: "/accept_invite"}, "Accept New Invitation")]

    if (this.props.hasActiveOrg){
      actions.push(h(Link, {to: "/select_org"}, "Select A Different Org"))
    }

    actions.push(h(Link, {to: "/login"}, "Sign In or Sign Up"))

    return actions
  }

}

const mapStateToProps = state => {
  return {
    hasActiveOrg: getActiveOrgs(state).length > 0
  }
}

const mapDispatchToProps = dispatch => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteFailed)

