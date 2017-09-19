import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import { Link } from 'react-router'
import {appLoaded, loadInviteRequest, acceptInvite, resetAcceptInvite} from 'actions'
import {
  getAppLoaded,
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
    if(!this.props.appLoaded)this.props.onLoad()
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
    if (this.props.inviteParamsVerified && !this.props.isLoadingInvite){
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
      h.div(".msg", "This invitation is invalid or expired. EnvKey invitations are valid for 24 hours, and can only be loaded once."),
      h.button({onClick: this.props.resetAcceptInvite}, "Go Back")
    ])
  }

  _renderSubmitLoadInvite(){
    if (this.props.isLoadingInvite){
      return h(Spinner)
    } else {
      return h.button("Next")
    }
  }

  _passwordCopy(){
    if (this._isNewUser()){
      return "Invite verified. To sign in, set a strong master encryption passphrase."
    } else {
      return "Invite verified. To sign in, enter your master encryption passphrase."
    }
  }

  _renderPasswordForm(){
    return h.form(".password-form", {
      onSubmit: ::this._onSubmitPassword,
    }, [
      h.p(".copy", this._passwordCopy()),
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
    if(this.props.isAuthenticating || this.props.isInvitee){
      return h(Spinner)
    } else {
      return <button>Sign In</button>
    }
  }
}

const mapStateToProps = state => {
  return {
    appLoaded: getAppLoaded(state),
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
    onLoad: ()=> dispatch(appLoaded()),
    onLoadInvite: p => dispatch(loadInviteRequest(p)),
    onSubmitPassword: p => dispatch(acceptInvite(p)),
    onReset: ()=> dispatch(resetAcceptInvite())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AcceptInvite)

