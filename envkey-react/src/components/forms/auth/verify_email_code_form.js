import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import Spinner from 'components/shared/spinner'

export default class VerifyEmailCodeForm extends React.Component {

  componentDidMount(){
    this.refs.emailVerificationCode.focus()
  }

  render(){
    return h.div(".verify-email-code", [

      h.div(".msg", [
        h.p(this.props.copy),
      ]),

      this._renderVerifyEmailCodeError(),

      h.form({onSubmit: this.props.onSubmit}, [

        h.fieldset([
          h.input({
            type: "password",
            disabled: this.props.isVerifyingEmailCode || this.props.isAuthenticating,
            ref: "emailVerificationCode",
            placeholder: `Your ${this.props.codeName} Token`,
            required: true,
            value: this.props.emailVerificationCode,
            onChange: this.props.onInputChange
          })
        ]),

        h.fieldset([
          this._renderVerifyEmailCodeSubmit()
        ])
      ])

    ])
  }

  _renderVerifyEmailCodeSubmit(){
    if (this.props.isVerifyingEmailCode || this.props.isAuthenticating){
      return h(Spinner)
    } else {
      const label = this.props.emailVerificationType == "sign_in" ? "Sign In" : "Next"
      return h.button(label)
    }
  }

  _renderVerifyEmailCodeError(){
    const codeName = this.props.emailVerificationType == "sign_in" ? "Sign In Token" : "Sign Up Token"
    if (this.props.verifyEmailCodeError || this.props.authError){
      return h.p(".error", [`Oops! We couldn't verify your email. Check your internet connection, confirm you have the right ${codeName}, and try again. If it's still not working, contact support: support@envkey.com`])
    }
  }
}

