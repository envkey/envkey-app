import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { Link } from 'react-router'
import { imagePath } from 'lib/ui'
import {OnboardOverlay} from 'components/onboard'

export default class HomeMenu extends React.Component {

  componentDidMount(){
    this.props.resetSession()
  }

  render(){
    return h(OnboardOverlay, [
      h.div([
        h.h1(".welcome", ["Welcome! ", h.em("Let's get started.")]),

        h.div(".home-menu", [
          h(Link, { className: "sign-in", to: (this.props.hasAccount ? "/select_account" : "/auth_methods/sign_in") }, [
            h.span(".img", [h.img({ src: imagePath("signin-blue.svg") })]),
            h.label("Sign In")
          ]),
          h(Link, { className: "sign-in", to: "/auth_methods/sign_up"}, [
            h.span(".img", [h.img({ src: imagePath("signin-blue.svg") })]),
            h.label("Sign Up")
          ]),
          h(Link, {className: "accept-invite", to: "/accept_invite"}, [
            h.span(".img", [h.img({src: imagePath("airplane-blue.svg")})]),
            h.label("Accept Invitation")
          ])
        ])
      ])
    ])
  }

}

