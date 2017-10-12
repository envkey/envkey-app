import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'

export default class SubEnvForm extends React.Component {

  componentDidMount() {
    this.refs.nameInput.focus()
  }

  _onAddSubEnv(e){
    e.preventDefault()
    this.props.addSubEnv({
      ...R.pick(["environment"], this.props),
      name: this.refs.nameInput.value
    })
  }

  render(){
    return h.form(".sub-env-form", {onSubmit: ::this._onAddSubEnv}, [
      h.input({
        ref: "nameInput",
        type: "text",
        placeholder: "Sub-environment name"
      }),
      h.button(".button", `Add ${this.props.environment} Sub-environment`)
    ])
  }
}