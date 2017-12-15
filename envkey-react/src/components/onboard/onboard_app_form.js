import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import {AppForm} from "../forms"

export default class OnboardAppForm extends React.Component {

  render(){
    const {createApp, isCreating, currentUser: {firstName}} = this.props

    return h.div(".onboard-app-form", [
      h.h1(".welcome", ["Create ", h.em("Application")]),

      h.p([
        "You're in! Go ahead and create an application. ",
        "To import config from an existing project in ",
        h.strong("KEY=VAL, "),
        h.strong("YAML,"),
        " or ",
        h.strong("JSON"),
        " format",
        ", select ",
        h.strong("Import Config"),
        ". Otherwise, choose ",
        h.strong("Start From Scratch.")
      ]),

      h(AppForm, {onSubmit: createApp, isSubmitting: isCreating, renderImportOpts: true})
    ])
  }
}