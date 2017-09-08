import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import { Link } from 'react-router'
import {
  appLoaded,
  verifyEmailRequest,
  verifyEmailCodeRequest,
  resetVerifyEmail,
  login,
  register
} from 'actions'
import {
  getAppLoaded,
  getIsAuthenticating,
  getAuthError,
  getVerifyingEmail,
  getEmailVerificationType,
  getEmailVerificationCode,
  getIsVerifyingEmail,
  getIsVerifyingEmailCode,
  getVerifyEmailError,
  getVerifyEmailCodeError,
  getCurrentUser
} from 'selectors'
import VerifyEmailCodeForm from 'components/forms/auth/verify_email_code_form'
import PasswordInput from 'components/shared/password_input'
import Spinner from 'components/shared/spinner'
import {imagePath} from 'lib/ui'
import {OnboardOverlay} from 'components/onboard'

const
  shouldShowRegisterForm = props =>{
    return props.emailVerificationCode || props.currentUser
  },

  shouldShowVerifyEmailCodeForm = props =>{
    return props.verifyingEmail && !shouldShowRegisterForm(props)
  },

  shouldShowEmailForm = props =>{
    return !shouldShowRegisterForm(props) && !shouldShowVerifyEmailCodeForm(props)
  }

class LoginRegister extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      firstName: "",
      lastName: "",
      email: props.verifyingEmail || "",
      emailVerificationCode: props.emailVerificationCode || "",
      orgName: "",
      password: ""
    }
  }

  componentDidMount(){
    if(!this.props.appLoaded)this.props.onLoad()
    this.refs.email.focus()
  }

  componentDidUpdate(prevProps, prevState){
    if(!shouldShowRegisterForm(prevProps) && shouldShowRegisterForm(this.props)){
      this.refs.orgName.focus()
    }
  }

  _onVerifyEmail(e){
    e.preventDefault()
    this.props.onVerifyEmail(R.pick(["email"], this.state))
  }

  _onVerifyEmailCode(e){
    e.preventDefault()
    const [fn, props ] = this.props.emailVerificationType == "sign_in" ?
      [this.props.onLogin, ["email", "emailVerificationCode"]] :
      [this.props.onVerifyEmailCode, ["email", "emailVerificationCode"]]

    fn(R.pick(props, this.state))
  }

  _onRegister(e){
    e.preventDefault()
    this.props.onRegister({
      ...R.pick(["firstName", "lastName", "email", "emailVerificationCode", "password"], this.state),
      org: {name: this.state.orgName},
    })
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
          h.h1([h.em(["Sign In ", h.small("/"), " Sign Up"])]),
          this._renderContent(),
          this._renderBackLink()
        ])
      ])
    ])
  }

  _renderContent(){
    if (shouldShowRegisterForm(this.props)){
      return this._renderRegister()
    } else if (shouldShowVerifyEmailCodeForm(this.props)){
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
            ref: "email",
            type: "email",
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

  _renderVerifyEmailError(){
    if (this.props.verifyEmailError){
      return h.p(".error", ["Oops! The request failed. Check your internet connection, ensure you entered a valid email address, and try again. If it's still not working, contact support: support@envkey.com"])
    }
  }

  _renderVerifyEmailCode(){
    const
      codeName = this.props.emailVerificationType == "sign_in" ? "Sign In" : "Sign Up",
      copy = [
        "Ok, we just sent you an email. When you get it, copy the ",
        h.strong(`${codeName} Token`),
        " into the input below."
      ]

    return h(VerifyEmailCodeForm, {
      ...this.props,
      copy,
      codeName,
      onSubmit: ::this._onVerifyEmailCode,
      onInputChange: (e)=> this.setState({emailVerificationCode: e.target.value})
    })
  }

  _renderRegister(){
    return h.div(".register-form", [

      h.div(".msg", [
        h.p("A few more details are needed to create your organization."),
      ]),

      this._renderRegisterError(),

      h.form({onSubmit: ::this._onRegister}, [
        h.fieldset([
          h.input({
            ref: "orgName",
            placeholder: "Organization name",
            required: true,
            value: this.state.orgName,
            onChange: (e)=> this.setState({orgName: e.target.value})
          })
        ]),

        h.fieldset([
          h.input({
            placeholder: "Your first name",
            required: true,
            value: this.state.firstName,
            onChange: (e)=> this.setState({firstName: e.target.value})
          })
        ]),

        h.fieldset([
          h.input({
            placeholder: "Your last name",
            required: true,
            value: this.state.lastName,
            onChange: (e)=> this.setState({lastName: e.target.value})
          })
        ]),

        h.fieldset([
          h(PasswordInput, {
            value: this.state.password,
            onChange: (e)=> this.setState({password: e.target.value})
          })
        ]),

        h.fieldset([
          this._renderRegisterSubmit()
        ])

      ])
    ])
  }

  _renderRegisterSubmit(){
    if (this.props.isAuthenticating || this.props.currentUser){
      return h(Spinner)
    } else {
      return h.button("Create Organization")
    }
  }

  _renderRegisterError(){
    if (this.props.authError){
      return h.p(".error", [`Oops! We couldn't create your organization. Check your internet connection and try again. If it's still not working, contact support: support@envkey.com`])
    }
  }

}

const mapStateToProps = state => {
  return {
    appLoaded: getAppLoaded(state),
    isAuthenticating: getIsAuthenticating(state),
    currentUser: getCurrentUser(state),
    authError: getAuthError(state),
    verifyingEmail: getVerifyingEmail(state),
    emailVerificationCode: getEmailVerificationCode(state),
    emailVerificationType: getEmailVerificationType(state),
    isVerifyingEmail: getIsVerifyingEmail(state),
    isVerifyingEmailCode: getIsVerifyingEmailCode(state),
    verifyEmailError: getVerifyEmailError(state),
    verifyEmailCodeError: getVerifyEmailCodeError(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLoad: ()=> dispatch(appLoaded()),
    onVerifyEmail: p => dispatch(verifyEmailRequest(p)),
    onVerifyEmailCode: p => dispatch(verifyEmailCodeRequest(p)),
    onReset: ()=> dispatch(resetVerifyEmail()),
    onLogin: p => dispatch(login(p)),
    onRegister: p => dispatch(register(p))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginRegister)

