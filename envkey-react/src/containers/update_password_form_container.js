import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { updateEncryptedPrivkey } from 'actions'
import {
  getIsUpdatingEncryptedPrivkey,
  getUpdateEncryptedPrivkeyErr,
  getCurrentUser
} from 'selectors'
import PasswordInput from 'components/shared/password_input'
import SmallLoader from 'components/shared/small_loader'
import PasswordCopy from 'components/shared/password_copy'

const defaultState = {
  oldPassword: "",
  newPassword: "",
  passwordValid: false,
  passwordScore: null,
  passwordFeedback: null,
  passwordUpdated: false
}

class UpdatePassword extends React.Component {

  constructor(){
    super()
    this.state = defaultState
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.isUpdatingEncryptedPrivkey && !nextProps.isUpdatingEncryptedPrivkey){
      this.setState({
        ...defaultState,
        passwordUpdated: !nextProps.updateEncryptedPrivkeyErr
      })
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit(R.pick(["oldPassword", "newPassword"], this.state))
  }

  render(){
    return h.form(".update-password-form", {ref: "form", onSubmit: ::this._onSubmit}, [
      h.fieldset([
        h.label("Change Master Encryption Passphrase"),

        this._renderError(),

        this._renderSuccess(),

        h(PasswordInput, {
          disabled: this.props.isUpdatingEncryptedPrivkey,
          value: this.state.oldPassword,
          placeholder: "CURRENT passphrase (10-256 characters)",
          onChange: (val) => this.setState({oldPassword: val})
        }),

        h(PasswordInput, {
          disabled: this.props.isUpdatingEncryptedPrivkey,
          value: this.state.newPassword,
          placeholder: "NEW passphrase (10-256 characters)",
          validateStrength: true,
          valid: this.state.passwordValid,
          score: this.state.passwordScore,
          feedback: this.state.passwordFeedback,
          strengthUserInputs: R.values(R.pick(["email", "firstName", "lastName"], this.props.currentUser)),
          onChange: (val, valid, score, feedback) => this.setState({
            newPassword: val,
            passwordValid: valid,
            passwordScore: score,
            passwordFeedback: feedback
          })
        }),

        this._renderSubmitPassword()
      ])
    ])
  }

  _renderSuccess(){
    if(this.state.passwordUpdated){
      return h.div(".msg", "Passphrase updated.")
    }
  }

  _renderError(){
    if(this.props.updateEncryptedPrivkeyErr){
      const errString = this.props.updateEncryptedPrivkeyErr.toString(),
            msg = errString == "Invalid passphrase" ?
              <span>Current passphrase invalid.</span> :
              <span>There was a problem setting your new passphrase. If the problem persists, please email support@envkey.com.</span>

      return h.div(".msg.update-password-error", [msg])
    }
  }

  _renderSubmitPassword(){
    if(this.props.isUpdatingEncryptedPrivkey){
      return h(SmallLoader)
    } else {
      const enabled = (this.state.passwordValid && this.state.oldPassword && this.state.oldPassword.length >= 10) ||
                      (!this.state.oldPassword && !this.state.newPassword)
      return <button disabled={!enabled}>Update Passphrase</button>
    }
  }

}

const mapStateToProps = state => {
  return {
    isUpdatingEncryptedPrivkey: getIsUpdatingEncryptedPrivkey(state),
    updateEncryptedPrivkeyErr: getUpdateEncryptedPrivkeyErr(state),
    currentUser: getCurrentUser(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSubmit: params => dispatch(updateEncryptedPrivkey(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdatePassword)

