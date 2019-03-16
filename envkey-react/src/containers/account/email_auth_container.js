import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { push } from 'react-router-redux'
import {
  verifyEmailRequest,
  verifyEmailCodeRequest,
  resetVerifyEmail,
  startExternalAuthSession,
  login
} from 'actions'
import VerifyEmailCodeForm from 'components/forms/auth/verify_email_code_form'
import Spinner from 'components/shared/spinner'
import {OnboardOverlay} from 'components/onboard'
import { pick } from 'envkey-client-core/dist/lib/utils/object'

import { AUTH_PROVIDERS } from 'components/shared/i18n'

const
  shouldShowVerifyEmailCodeForm = props =>{
    return props.verifyingEmail
  },

  shouldShowEmailForm = props =>{
    return !shouldShowVerifyEmailCodeForm(props)
  }

class EmailAuth extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      email: props.verifyingEmail || "",
      emailVerificationCode: props.emailVerificationCode || ""
    }
  }

  componentDidMount(){
    this.refs.email.focus()
  }

  componentWillReceiveProps(nextProps) {
    // The email verification flow can be triggered from auth_methods_container,
    // so we need to update the email state here.
    if (this.props.verifyingEmail !== nextProps.verifyingEmail &&
        nextProps.verifyingEmail !== this.state.email
    ) {
      this.setState({ email: nextProps.verifyingEmail })
    }
  }

  _onVerifyEmail(e){
    e.preventDefault()
    this.props.onVerifyEmail({
      ...R.pick(["email"], this.state),
      verificationType: (this.props.params.authType == "sign_in" ? "sign_in" : "registration"),
    })
  }

  _onVerifyEmailCode(e){
    e.preventDefault()
    const [fn, props ] = this.props.emailVerificationType == "sign_in" ?
      [this.props.onLogin, ["email", "emailVerificationCode"]] :
      [this.props.onVerifyEmailCode, ["email", "emailVerificationCode"]]

    fn(R.pick(props, this.state))
  }

  _onResendEmailVerification(){
    this.props.onVerifyEmail(R.pick(["email"], this.state))
  }

  _onReset(){
    this.props.onReset()
  }

  render(){
    return h(OnboardOverlay, [
      h.div([
        h.div(".onboard-auth-form.login-register", [
          h.h1([this._title(), " Via ", h.em("Email")]),
          this._renderContent(),
          this._renderBackLink()
        ])
      ])
    ])
  }

  _title() {
    return this.props.params.authType == "sign_in" ? "Sign In" : "Sign Up"
  }

  _renderContent(){
    if (shouldShowVerifyEmailCodeForm(this.props)){
      return this._renderVerifyEmailCode()
    } else if (shouldShowEmailForm(this.props)){
      return this._renderVerifyEmail()
    }
  }

  _renderBackLink(){
    return h(Link, {className: "back-link", to: "/home", onClick: this.props.onReset}, [
      h.span(".img", "←"),
      h.span("Back To Home")
    ])
  }

  _renderVerifyEmail(){
    return h.div(".verify-email", [

      h.div(".msg", [
        h.p("Enter your email below:"),
      ]),

      this._renderVerifyEmailError(),

      h.form({onSubmit: ::this._onVerifyEmail}, [
        h.fieldset([
          h.input({
            type: "email",
            disabled: this.props.isVerifyingEmail,
            ref: "email",
            placeholder: "Your email",
            required: true,
            value: this.state.email,
            disabled: this.props.isVerifyingEmail,
            onChange: (e)=> this.setState({email: e.target.value})
          })
        ]),

        h.fieldset([
          this._renderVerifyEmailSubmit()
        ])
      ])

    ])
  }

  _renderVerifyEmailSubmit(){
    if (this.props.isVerifyingEmail){
      return h(Spinner)
    } else {
      return h.button("Next")
    }
  }

  _authLink(existingProvider) {
    const newProvider = existingProvider || 'email'
    const authType = existingProvider == null ? 'sign_up' : 'sign_in'
    const verificationType = existingProvider == null ? 'registration' : 'sign_in'
    const providerTitle = AUTH_PROVIDERS[existingProvider || 'email'] || '[unknown provider]'
    const actionTitle = authType === 'sign_in' ? 'In' : 'Up'
    const linkTextHTML = `Sign ${actionTitle} Via ${providerTitle}`.replace(/ /g, '&nbsp;')

    const linkPrefix = newProvider === 'email' ? 'email_auth' : 'auth_methods'
    const linkURL = `/${linkPrefix}/${authType}`

    return h(Link, {
      to: linkURL,
      dangerouslySetInnerHTML: {__html: linkTextHTML},
      onClick: () => {
        if (newProvider === 'email') {
          this.props.onVerifyEmail({
            ...R.pick(["email"], this.state),
            verificationType
          })
          return
        }
        this.props.onStartExternalAuthSession({
          authType,
          provider: newProvider,
          authMethod: "oauth_cloud",
        })
      }
    })
  }

  _renderVerifyEmailError() {
    if (!this.props.verifyEmailError) return null

    const emailError = R.path(['response', 'data', 'errors', 'email', 0], this.props.verifyEmailError)
    if (emailError) {
      // const verificationType = R.path(['response', 'data', 'verificationType'], this.props.verifyEmailError)
      const existingProvider = R.path(['response', 'data', 'existingProvider'], this.props.verifyEmailError)
      return h.p(".error", [h.span(emailError), ' ', this._authLink(existingProvider)])
    }
    return h.p(".error", [
      "Oops! The request failed. Check your internet connection, " +
      "ensure you entered a valid email address, and try again. " +
      "If it's still not working, contact support: support@envkey.com"
    ])
  }

  _renderVerifyEmailCode(){
    const
      codeName = this.props.emailVerificationType == "sign_in" ? "Sign In" : "Sign Up",
      copy = [
        "Ok, we just sent you an email. When you get it, copy the ",
        h.br(),
        h.strong(`${codeName} Token`),
        " into the input below."
      ]

    return h(VerifyEmailCodeForm, {
      ...this.props,
      copy,
      codeName,
      onSubmit: ::this._onVerifyEmailCode,
      emailVerificationCode: this.state.emailVerificationCode,
      onInputChange: (e)=> this.setState({emailVerificationCode: e.target.value})
    })
  }
}

const mapStateToProps = state => {
  return {
    ...pick([
      "verifyingEmail",
      "emailVerificationCode",
      "emailVerificationType",
      "isVerifyingEmail",
      "isVerifyingEmailCode",
      "verifyEmailError",
      "verifyEmailCodeError",
    ], state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onVerifyEmail: (p) => {
      dispatch(verifyEmailRequest(p))
    },
    onVerifyEmailCode: p => dispatch(verifyEmailCodeRequest(p)),
    onStartExternalAuthSession: (props) => {
      const { authType } = props
      dispatch(startExternalAuthSession(props))
      dispatch(push(`/email_auth/${authType}`))
    },
    onReset: ()=> dispatch(resetVerifyEmail()),
    onLogin: p => dispatch(login(p))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EmailAuth)

