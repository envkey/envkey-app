import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import SmallLoader from 'components/shared/small_loader'
import {secureRandomAlphanumeric} from 'lib/crypto'

export default class AppImporter extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      tab: props.environments[0],
      textByEnvironment: {},
      format: "env"
    }
  }

  _onSubmit(){
    this.props.onSubmit(this.toImport())
  }

  toImport(){
    return R.pick(["textByEnvironment", "format"], this.state)
  }

  render(){
    return h.form(".object-form.app-importer", [
      h.p("Paste in your development, staging, and production config in .env (KEY=VAL) format. If you aren’t ready to import an environment, just leave it blank."),
      h.div(".tabs", [
        this._renderTabBar(),
        this._renderSelectedTab()
      ]),
      this._renderSubmit()
    ])
  }

  _renderTabBar(){
    return h.div(".tab-bar",
      this.props.environments.map(environment => {
        return h.span({
          onClick: ()=> this.setState({tab: environment}),
          className: (this.state.tab == environment ? "selected" : "")
        },[
          h.small(".check",(this.state.textByEnvironment[environment] ? "✓ " : "")),
          h.span(environment)
        ])
      })
    )
  }

  _renderSelectedTab(){
    return h.div(".selected-tab", [
      h.textarea({
        disabled: this.props.isSubmitting,
        value: this.state.textByEnvironment[this.state.tab] || "",
        placeholder: `# Paste your app's ${this.state.tab} variables here\n\nSOME_API_KEY=${secureRandomAlphanumeric(40)}\nEMPTY_STRING=\n\n# A comment - ignored by parser\n\nWITH_QUOTES='some ${this.state.tab} value'`,
        onChange: e => {
          this.setState(R.assocPath(["textByEnvironment", this.state.tab], e.target.value))
        }
      })
    ])
  }

  _renderSubmit(){
    if (!this.props.embeddedInAppForm){
      if(this.props.isSubmitting){
        return h.div(".actions", [
          h.button(".secondary", {disabled: true}, "Skip"),
          h.button({disabled: true}, ["Importing..."]),
        ])
      } else {
        return h.div(".actions", [
          h.button(".secondary",{onClick: this.props.skip}, "Skip"),
          h.button({
            onClick: ::this._onSubmit,
            disabled: !R.pipe(R.values, R.any(R.identity))(this.state.textByEnvironment)
          }, "Import")
        ])
      }
    }
  }

}