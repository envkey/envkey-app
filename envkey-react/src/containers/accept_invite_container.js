import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import {appLoaded, loadInviteRequest, acceptInvite, resetAcceptInvite} from 'actions'
import {
  getIsAuthenticating,
  getInviteParams,
  getInviteParamsVerified,
  getInviteParamsInvalid,
  getAcceptInviteEmailError,
  getIsLoadingInvite,
  getLoadInviteError
} from 'selectors'
import PasswordInput from 'components/shared/password_input'
import Spinner from 'components/shared/spinner'
import {imagePath} from 'lib/ui'

class AcceptInvite extends React.Component {

  constructor(){
    super()
    this.state = {
      emailVerificationCode: "",
      encryptionCode: "",
      password: ""
    }
  }

  componentDidMount() {
    this.props.onLoad()
  }

  _onSubmitPassword(e){
    e.preventDefault()
    this.props.onSubmitPassword(R.pick(["password"], state))
  }

  _onLoadInvite(e){
    e.preventDefault()
    const [identityHash, passphrase] = this.state.encryptionCode.split("-")
    this.props.onLoadInvite({
      emailVerificationCode: this.state. emailVerificationCode,
      identityHash,
      passphrase
    })
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
    if (this.props.inviteParamsVerified){
      return this._renderPasswordForm()
    } else if (this.props.loadInviteError) {
      return this._renderLoadError()
    } else {
      return this._renderLoadInviteForm()
    }
  }

  _renderLoadInviteForm(){
    return h.div(".load-invite-form", [
      h.div(".msg", [
        h.p(`Welcome to Envkey! To accept a secure invitation, you need two codes:`)
      ]),

      h.form({onSubmit: ::this._onLoadInvite}, [

        h.fieldset([
          h.p([
            h.strong("1.) "),
            "An ",
            h.strong("Invite Code"),
            ", which you receive in an email from Envkey <support@envkey.com>."
          ]),
          h.input({
            type: "password",
            placeholder: "Invite Code",
            value: this.state.emailVerificationCode,
            onChange: e => this.setState({emailVerificationCode: e.target.value})
          })
        ]),

        h.fieldset([
          h.p([
            h.strong("2.) "),
            "An ",
            h.strong("Encryption Code"),
            ", which you receive directly from the user who invited you."
          ]),
          h.input({
            type: "password",
            placeholder: "Encryption Code",
            value: this.state.encryptionCode,
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
      h.div(".msg", "This invitation is invalid or expired. Envkey invitations are valid for 24 hours, and can only be loaded once."),
      h.button("Go Back", {onClick: this.props.resetAcceptInvite})
    ])
  }

  _renderSubmitLoadInvite(){
    if (this.props.isLoadingInvite){
      return h(Spinner)
    } else {
      return h.button("Submit")
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
        h(PasswordInput, {
          value: this.state.password,
          onChange: e => this.setState({password: e.target.value})
        })
      ]),
      h.fieldset([this._renderSubmitPassword()])
    ])
  }

  _renderSubmitPassword(){
    if(this.props.isAuthenticating){
      return <button disabled={true}>Submitting... </button>
    } else {
      return <button>Sign In</button>
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
    loadInviteError: getLoadInviteError(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLoad: ()=> dispatch(appLoaded()),
    onLoadInvite: p => dispatch(loadInviteRequest(p)),
    onSubmitPassword: p => dispatch(acceptInvite(p)),
    onReset: ()=> dispatch(resetAcceptInvite())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AcceptInvite)

