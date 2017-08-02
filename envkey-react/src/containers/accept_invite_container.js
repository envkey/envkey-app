import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import {appLoaded, loadInvite, verifyInviteEmailRequest, acceptInvite} from 'actions'
import {
  getIsAuthenticating,
  getInviteLoaded,
  getLoadInviteError,
  getInviteParams,
  getInviteParamsVerified,
  getInviteParamsInvalid,
  getIsVerifyingInviteEmail,
  getVerifyInviteEmailError,
  getInviteEmailVerified,
  getAcceptInviteEmailError
} from 'selectors'
import PasswordInput from 'components/shared/password_input'
import {imagePath} from 'lib/ui'


class AcceptInvite extends React.Component {

  componentDidMount() {
    this.props.onLoad(R.pick(["identityHash", "passphrase"], this.props.params))
  }

  _onSubmitPassword(e){
    e.preventDefault()
    if (!this.props.isAuthenticating){
      this.props.onSubmitPassword({
        ...R.pick(["identityHash"], this.props.params),
        password: this.refs.password.val()
      })
    }
  }

  _onVerifyEmail(e){
    e.preventDefault()
    if (!this.props.isVerifyingInviteEmail){
      this.props.onVerifyEmail({
        ...R.pick(["identityHash"], this.props.params),
        emailVerificationCode: this.refs.emailVerificationCode.value
      })
    }
  }

  _isNewUser(){
    return this.props.inviteParams && !this.props.inviteParams.invitee.pubkey
  }

  render(){
    return h.div(".full-overlay", [
      h.div(".auth-form.accept-invite", [
        h.div(".logo", [
          h.img({src: imagePath("envkey-logo.svg")})
        ]),
        h.div(".content", [
          this._renderContent()
        ])
      ])
    ])
  }

  _renderContent(){
    if (this.props.inviteLoaded){

      if (this.props.inviteParamsVerified){

        if (this.props.inviteEmailVerified){

          return this._renderPasswordForm()

        } else if (this.props.verifyInviteEmailError) {

          return this._renderEmailVerificationError()

        } else {

          return this._renderVerifyEmailForm()

        }

      } else if (this.props.inviteParamsInvalid){

        return this._renderParamsInvalid()

      } else {

        return this._renderVerifyingInviteParams()

      }
    } else if (this.props.loadInviteError){

      return this._renderLoadError()

    } else {

      return this._renderLoadingInvite()

    }
  }

  _renderLoadError(){
    return h.div(".msg", "This invitation is invalid or expired. Envkey invitations can only be opened once.")
  }

  _renderParamsInvalid(){
    return h.div(".msg", "This invitation's signature does not match the server's response.")
  }

  _renderEmailVerificationError(){
    return h.div(".msg", "That email code couldn't be verified.")
  }

  _renderLoadingInvite(){
    return h.div(".msg", "Loading invitation...")
  }

  _renderVerifyingInviteParams(){
    return h.div("Verifying invitation signature...")
  }


  _renderVerifyEmailForm(){
    const {invitedBy, invitee, org: {name: orgName}} = this.props.inviteParams,
          invitedByFullName = [invitedBy.firstName, invitedBy.lastName].join(" ")

    return h.form(".verify-email-form", {
      onSubmit: ::this._onVerifyEmail,
    }, [
      h.div(".msg", [
        h.p(`Welcome ${this._isNewUser() ? "to" : "back to"} Envkey, ${invitee.firstName}! You've been invited by ${invitedByFullName} <${invitedBy.email}> to securely access ${orgName}'s config.`),
        h.p(`First, we need to verify your email address. `),
        h.p(`We sent a verification code to ${invitee.email}. When you get it, copy the code into the input below.`)
      ]),
      h.fieldset([
        h.input({type: "password", ref: "emailVerificationCode"})
      ]),
      h.fieldset([this._renderSubmitEmailVerification()])
    ])
  }

  _renderSubmitEmailVerification(){
    if(this.props.isVerifyingInviteEmail){
      return <button disabled={true}>Verifying email... </button>
    } else {
      return <button>Verify Email</button>
    }
  }

  _passwordCopy(){
    if (this._isNewUser()){
      return "Email verified. To finish creating your account, set an encryption password."
    } else {
      return "Email verified. To finish accepting your invitation, enter your encryption password below."
    }
  }

  _renderPasswordForm(){
    return h.form(".password-form", {
      onSubmit: ::this._onSubmitPassword,
    }, [
      h.div(".msg", this._passwordCopy()),
      h.fieldset([
        h(PasswordInput, {ref: "password"})
      ]),
      h.fieldset([this._renderSubmitPassword()])
    ])
  }

  _renderSubmitPassword(){
    if(this.props.isAuthenticating){
      return <button disabled={true}>Submitting... </button>
    } else {
      return <button>Login</button>
    }
  }

}

const mapStateToProps = state => {
  return {
    inviteLoaded: getInviteLoaded(state),
    loadInviteError: getLoadInviteError(state),
    inviteParams: getInviteParams(state),
    inviteParamsVerified: getInviteParamsVerified(state),
    inviteParamsInvalid: getInviteParamsInvalid(state),
    isVerifyingInviteEmail: getIsVerifyingInviteEmail(state),
    verifyInviteEmailError: getVerifyInviteEmailError(state),
    inviteEmailVerified: getInviteEmailVerified(state),
    acceptInviteEmailError: getAcceptInviteEmailError(state),
    isAuthenticating: getIsAuthenticating(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLoad: params => {
      dispatch(appLoaded())
      dispatch(loadInvite(params))
    },
    onVerifyEmail: p => dispatch(verifyInviteEmailRequest(p)),
    onSubmitPassword: p => dispatch(acceptInvite(p))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AcceptInvite)

