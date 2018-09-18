import React from 'react'
import { Link } from 'react-router'
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
        this._renderError(),
        h.fieldset([h(PasswordInput, {ref: "password"})]),
        h.fieldset([h.button("Decrypt Environments")]),
        h.p(".msg.msg-reset-account", ["Forgot your passphrase? ", h(Link, {to: "/reset_account"}, ["Reset your account."])])
      ])
    ])
  }

  _renderError(){
    if (this.props.decryptPrivkeyErr){
      return h.div(".msg", [
        h.p("Incorrect passphrase. Please try again.")         
      ])
    } else if (this.props.decryptAllErr){
      return h.div(".msg", "There was a problem decrypting and verifying your config. Enter your passphrase and try again. If the problem persists, please email support@envkey.com.")
    }
  }

}