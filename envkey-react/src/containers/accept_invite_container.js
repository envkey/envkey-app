import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import { Link } from 'react-router'
import {loadInviteRequest, acceptInvite, resetAcceptInvite} from 'actions'
import {
  getIsAuthenticating,
  getInviteParams,
  getInviteParamsVerified,
  getInviteParamsInvalid,
  getAcceptInviteEmailError,
  getIsLoadingInvite,
  getLoadInviteError,
  getIsInvitee
} from 'selectors'
import PasswordInput from 'components/shared/password_input'
import Spinner from 'components/shared/spinner'
import {OnboardOverlay} from 'components/onboard'
import PasswordCopy from 'components/shared/password_copy'

const initialState = {
  emailVerificationCode: "",
  encryptionCode: "",
  password: "",
  passwordValid: false,
  passwordScore: null,
  passwordFeedback: null
}

class AcceptInvite extends React.Component {

  constructor(){
    super()
    this.state = initialState
  }

  componentDidMount() {
    if(this.refs.inviteToken)this.refs.inviteToken.focus()
  }

  _onSubmitPassword(e){
    e.preventDefault()
    this.props.onSubmitPassword(R.pick(["password"], this.state))
  }

  _onLoadInvite(e){
    e.preventDefault()
    const [identityHash, passphrase] = this.state.encryptionCode.split("_")
    this.props.onLoadInvite({
      emailVerificationCode: this.state.emailVerificationCode,
      identityHash,
      passphrase
    })
  }

  _isNewUser(){
    return this.props.inviteParams && !this.props.inviteParams.invitee.pubkey
  }

  render(){
    return h(OnboardOverlay, [
      h.div([
        h.h1([h.em("Accept Invitation")]),
        h.div(".onboard-auth-form.accept-invite-form", [
          this._renderContent(),
          this._renderBackLink()
        ])
      ])
    ])
  }

  _renderContent(){
    if (this.props.inviteParamsVerified && !this.props.loadInviteError && !this.props.isLoadingInvite){
      return this._renderPasswordForm()
    } else if (this.props.loadInviteError) {
      return this._renderLoadError()
    } else {
      return this._renderLoadInviteForm()
    }
  }

  _renderBackLink(){
    return h(Link, {className: "back-link", to: "/home", onClick: ::this.props.onReset}, [
      h.span(".img", "←"),
      h.span("Back To Home")
    ])
  }

  _renderLoadInviteForm(){
    return h.div(".load-invite-form", [

      // h.p(".copy", "To accept an invitation, you need two tokens."),

      h.form({onSubmit: ::this._onLoadInvite}, [

        h.fieldset({className: "invite-token"}, [
          h.p([
            h.strong(".num", "1 "),
            h.span([
            h.strong("Invite Token"),
            ", received in an email from EnvKey <support@envkey.com>"
            ])
          ]),
          h.input({
            type: "password",
            disabled: this.props.isLoadingInvite,
            ref: "inviteToken",
            placeholder: "Invite Token",
            required: true,
            value: this.state.emailVerificationCode,
            onChange: e => this.setState({emailVerificationCode: e.target.value})
          })
        ]),

        h.fieldset({className: "encryption-token"}, [
          h.p([
            h.strong(".num", "2 "),
            h.span([
              h.strong("Encryption Token"),
              ", received directly from the person who invited you"
            ])

          ]),
          h.input({
            type: "password",
            placeholder: "Encryption Token",
            disabled: this.props.isLoadingInvite,
            value: this.state.encryptionCode,
            required: true,
            onChange: e => this.setState({encryptionCode: e.target.value})
          })
        ]),

        h.fieldset([
          this._renderSubmitLoadInvite()
        ])

      ])
    ])
  }

  _renderLoadError(){
    return h.div(".load-invite-error", [
      h.p("This invitation is invalid or expired. EnvKey invitations are valid for 24 hours, and can only be loaded once."),
      h.button({onClick: ()=> this.setState(initialState, this.props.onReset)}, "Go Back")
    ])
  }

  _renderSubmitLoadInvite(){
    if (this.props.isLoadingInvite){
      return h(Spinner)
    } else {
      return h.button("Next")
    }
  }

  _passwordPrompt(){
    if (this._isNewUser()){
      return "Invite verified. To sign in, set a strong master encryption passphrase."
    } else {
      return "Invite verified. To sign in, enter your master encryption passphrase."
    }
  }

  _renderPasswordForm(){
    return h.div([
      h.form(".password-form", {
        onSubmit: ::this._onSubmitPassword,
      }, [
        h.p(".copy", this._passwordPrompt()),
        h.fieldset([
          h(PasswordInput, {
            confirm: this._isNewUser(),
            disabled: this.props.isAuthenticating || this.props.isInvitee,
            value: this.state.password,
            validateStrength: this._isNewUser(),
            valid: this.state.passwordValid,
            score: this.state.passwordScore,
            feedback: this.state.passwordFeedback,
            strengthUserInputs: R.values(R.pick(["email", "firstName", "lastName"], this.props.inviteParams.invitee)),
            onChange: (val, valid, score, feedback) => this.setState({
              password: val,
              passwordValid: valid,
              passwordScore: score,
              passwordFeedback: feedback
            })
          })
        ]),
        h.fieldset([this._renderSubmitPassword()]),
      ]),

      (this._isNewUser() ? h(PasswordCopy) : null)
    ])
  }

  _renderSubmitPassword(){
    if(this.props.isAuthenticating || this.props.isInvitee){
      return h(Spinner)
    } else {
      return <button disabled={!this.state.passwordValid}>Sign In</button>
    }
  }
}

const mapStateToProps = state => {
  return {
    inviteParams: getInviteParams(state),
    inviteParamsVerified: getInviteParamsVerified(state),
    inviteParamsInvalid: getInviteParamsInvalid(state),
    acceptInviteEmailError: getAcceptInviteEmailError(state),
    isAuthenticating: getIsAuthenticating(state),
    isLoadingInvite: getIsLoadingInvite(state),
    loadInviteError: getLoadInviteError(state),
    isInvitee: getIsInvitee(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLoadInvite: p => dispatch(loadInviteRequest(p)),
    onSubmitPassword: p => dispatch(acceptInvite(p)),
    onReset: ()=> dispatch(resetAcceptInvite())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AcceptInvite)

