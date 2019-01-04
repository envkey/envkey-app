import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import { Link } from 'react-router'
import {
  verifyEmailRequest,
  verifyEmailCodeRequest,
  resetVerifyEmail,
  login,
  register
} from 'actions'
import { getCurrentUser } from 'selectors'
import VerifyEmailCodeForm from 'components/forms/auth/verify_email_code_form'
import PasswordInput from 'components/shared/password_input'
import PasswordCopy from 'components/shared/password_copy'
import Spinner from 'components/shared/spinner'
import {OnboardOverlay} from 'components/onboard'
import { pick } from  'envkey-client-core/dist/lib/utils/object'

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
      password: "",
      passwordValid: false,
      passwordScore: null,
      passwordFeedback: null,
      heardAbout: ""
    }
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
      org: {name: this.state.orgName, heardAbout: this.state.heardAbout},
    })
  }

  _onResendEmailVerification(){
    this.props.onVerifyEmail(R.pick(["email"], this.state))
  }

  _onReset(){
    this.props.onReset()
  }

  _createOrgEnabled(){
    return this.state.firstName && this.state.lastName && this.state.orgName && this.state.passwordValid
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
        h.br(),
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

      this._renderRegisterCopy(),

      h.form({onSubmit: ::this._onRegister}, [
        h.fieldset(".org-name", [
          h.input({
            type: "text",
            disabled: this.props.isAuthenticating || this.props.currentUser,
            ref: "orgName",
            placeholder: "Organization name",
            required: true,
            value: this.state.orgName,
            onChange: (e)=> this.setState({orgName: e.target.value})
          })
        ]),

        h.fieldset(".first-name",[
          h.input({
            type: "text",
            disabled: this.props.isAuthenticating || this.props.currentUser,
            placeholder: "Your first name",
            required: true,
            value: this.state.firstName,
            onChange: (e)=> this.setState({firstName: e.target.value})
          })
        ]),

        h.fieldset(".last-name",[
          h.input({
            type: "text",
            disabled: this.props.isAuthenticating || this.props.currentUser,
            placeholder: "Your last name",
            required: true,
            value: this.state.lastName,
            onChange: (e)=> this.setState({lastName: e.target.value})
          })
        ]),

        h.fieldset(".heard-about", [
          h.select({
            onChange: (e)=> this.setState({heardAbout: e.target.value})
          },[
            h.option({disabled: true, selected: true}, ["How did you find out about EnvKey?"]),
            h.option("Friend or colleague"),
            h.option("Google search"),
            h.option("HackerNews"),
            h.option("Reddit"),
            h.option("Twitter"),
            h.option("Another website"),
            h.option("Facebook Ad"),
            h.option("Google Ad"),
            h.option("Reddit Ad"),
            h.option("Other")
          ])
        ]),

        h.fieldset(".passphrase",[
          h(PasswordInput, {
            type: "text",
            confirm: true,
            disabled: this.props.isAuthenticating || this.props.currentUser,
            value: this.state.password,
            validateStrength: true,
            valid: this.state.passwordValid,
            score: this.state.passwordScore,
            feedback: this.state.passwordFeedback,
            strengthUserInputs: [this.state.orgName, this.state.firstName, this.state.lastName, this.state.email],
            onChange: (val, valid, score, feedback) => this.setState({
              password: val,
              passwordValid: valid,
              passwordScore: score,
              passwordFeedback: feedback
            })
          })
        ]),

        h.fieldset([
          this._renderRegisterSubmit()
        ]),
      ]),

      h(PasswordCopy)
    ])
  }

  _renderRegisterSubmit(){
    if (this.props.isAuthenticating || this.props.currentUser){
      return h(Spinner)
    } else {
      return h.button({disabled: !this._createOrgEnabled()}, "Create Organization")
    }
  }

  _renderRegisterCopy(){
    if (this.props.authError){
      return h.p(".error", [`Oops! That didn't work. Check your connection and try again. If it's still not working, contact support@envkey.com`])
    } else {
      return h.div(".msg", [
        h.p("A few more details are needed to create your organization."),
      ])
    }
  }

}

const mapStateToProps = state => {
  return {
    ...pick([
      "isAuthenticating",
      "authError",
      "verifyingEmail",
      "emailVerificationCode",
      "emailVerificationType",
      "isVerifyingEmail",
      "isVerifyingEmailCode",
      "verifyEmailError",
      "verifyEmailCodeError",
    ], state),
    currentUser: getCurrentUser(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onVerifyEmail: p => dispatch(verifyEmailRequest(p)),
    onVerifyEmailCode: p => dispatch(verifyEmailCodeRequest(p)),
    onReset: ()=> dispatch(resetVerifyEmail()),
    onLogin: p => dispatch(login(p)),
    onRegister: p => dispatch(register(p))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginRegister)

