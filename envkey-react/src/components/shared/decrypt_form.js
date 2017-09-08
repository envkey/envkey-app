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
        this._renderError(),
        h.fieldset([h(PasswordInput, {ref: "password"})]),
        h.fieldset([h.button("Decrypt Environments")])
      ])
    ])
  }

  _renderError(){
    if (this.props.decryptPrivkeyErr){
      return h.div(".msg", "Incorrect passphrase. Please try again.")
    } else if (this.props.decryptEnvsErr){
      return h.div(".msg", "Your passphrase was correct, but there was a problem decrypting and verifying your config. If the problem persists, please email support@envkey.com.")
    }
  }



}