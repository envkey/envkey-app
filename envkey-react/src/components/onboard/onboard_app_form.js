import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import {AppForm} from "../forms"

export default class OnboardAppForm extends React.Component {

  render(){
    const {createApp, isCreating, currentUser: {firstName}} = this.props

    return h.div(".onboard-app-form", [
      h.h1(".welcome", ["Welcome, ", h.em(firstName + ".")]),

      h.p("You’re a few steps away from simple, secure, bug-free config for your team and your infrastructure."),

      h.h2("Create your first application."),

      h(AppForm, {onSubmit: createApp, isSubmitting: isCreating, renderImportOpts: true})
    ])
  }
}