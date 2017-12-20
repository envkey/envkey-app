import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import SmallLoader from 'components/shared/small_loader'
import { parseMultiFormat } from 'lib/parse'
import { importerPlaceholder } from 'lib/env/imports'

export default class AppImporter extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      tab: props.environments[0],
      textByEnvironment: {},
      parsedByEnvironment: {},
      validByEnvironment: {},
      format: "env"
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit(this.toImport())
  }

  _onSkip(e){
    e.preventDefault()
    this.props.skip()
  }

  _onChange(e){
    const txt = e.target.value
    let val, valid

    if(txt){
      val = parseMultiFormat(txt.trim())
      valid = val != null
    } else {
      val = null
      valid = false
    }

    const updated = R.pipe(
      R.assocPath(["textByEnvironment", this.state.tab], txt),
      R.assocPath(["parsedByEnvironment", this.state.tab], val),
      R.assocPath(["validByEnvironment", this.state.tab], valid)
    )

    this.setState(updated, ()=> {
      if (this.props.onChange){
        this.props.onChange(this._environmentsValid() && this._hasAnyValue())
      }
    })
  }

  _environmentsValid(){
    for (let environment of this.props.environments){
      if(this.state.textByEnvironment[environment] && !this.state.validByEnvironment[environment]){
        return false
      }
    }
    return true
  }

  _hasAnyValue(){
    return R.any(R.identity, R.values(this.state.textByEnvironment))
  }

  toImport(){
    return R.pick(["parsedByEnvironment"], this.state)
  }

  render(){
    return h.form(".object-form.app-importer", [
      <p>Paste in your development, staging, and production config in <strong>KEY=VAL</strong>, <strong>YAML</strong>, or <strong>JSON</strong> format. If you aren’t ready to import an environment, just leave it blank.</p>,
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
        const valid = this.state.validByEnvironment[environment],
              empty = !this.state.textByEnvironment[environment]

        let checkLbl
        if (valid && !empty){
          checkLbl = "✓ "
        } else if (!empty){
          checkLbl = "✕"
        } else {
          checkLbl = ""
        }

        return h.span({
          onClick: ()=> this.setState({tab: environment}),
          className: (this.state.tab == environment ? "selected" : "")
        },[
          h.small(".check", checkLbl),
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
        placeholder: importerPlaceholder(this.state.tab),
        onChange: ::this._onChange
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
          h.button(".secondary",{onClick: ::this._onSkip}, "Skip"),
          h.button({
            onClick: ::this._onSubmit,
            disabled: !this._environmentsValid() || !this._hasAnyValue()
          }, "Import")
        ])
      }
    }
  }

}