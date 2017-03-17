import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import PasswordInput from 'components/shared/password_input'

export default class DecryptForm extends React.Component {

  componentDidMount() {
    this.refs.password.focus()
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit(this.refs.password.val())
  }

  render(){
    return h.div(".viewport-overlay", [
      h.form(".auth-form.decrypt-form", {onSubmit: ::this._onSubmit}, [
        h.fieldset([h(PasswordInput, {ref: "password"})]),
        h.fieldset([h.button("Decrypt Environments")])
      ])
    ])
  }

}