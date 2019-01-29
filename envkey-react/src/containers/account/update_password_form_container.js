import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import { updateEncryptedPrivkey } from 'actions'
import {
  getCurrentUser
} from 'selectors'
import PasswordInput from 'components/shared/password_input'
import SmallLoader from 'components/shared/small_loader'
import { pick } from 'envkey-client-core/dist/lib/utils/object'

const defaultState = {
  oldPassphrase: "",
  newPassphrase: "",
  passphraseValid: false,
  passphraseScore: null,
  passphraseFeedback: null,
  passphraseUpdated: false
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
        passphraseUpdated: !nextProps.updateEncryptedPrivkeyErr
      })
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit(R.pick(["oldPassphrase", "newPassphrase"], this.state))
  }

  render(){
    return h.form(".update-password-form", {ref: "form", onSubmit: ::this._onSubmit}, [
      h.fieldset([
        h.label("Change Master Encryption Passphrase"),

        this._renderError(),

        this._renderSuccess(),

        h(PasswordInput, {
          disabled: this.props.isUpdatingEncryptedPrivkey,
          value: this.state.oldPassphrase,
          placeholder: "CURRENT passphrase (10-256 characters)",
          onChange: (val) => this.setState({oldPassphrase: val})
        }),

        h(PasswordInput, {
          confirm: true,
          disabled: this.props.isUpdatingEncryptedPrivkey,
          value: this.state.newPassphrase,
          placeholder: "NEW passphrase (10-256 characters)",
          validateStrength: true,
          valid: this.state.passphraseValid,
          score: this.state.passphraseScore,
          feedback: this.state.passphraseFeedback,
          strengthUserInputs: R.values(R.pick(["email", "firstName", "lastName"], this.props.currentUser)),
          onChange: (val, valid, score, feedback) => {
            this.setState({
              newPassphrase: val,
              passphraseValid: valid,
              passphraseScore: score,
              passphraseFeedback: feedback
            })
          }
        }),

        this._renderSubmitPassword()
      ])
    ])
  }

  _renderSuccess(){
    if(this.state.passphraseUpdated){
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
      const enabled = (this.state.passphraseValid && this.state.oldPassphrase && this.state.oldPassphrase.length >= 10) ||
                      (!this.state.oldPassphrase && !this.state.newPassphrase)
      return <button disabled={!enabled}>Update Passphrase</button>
    }
  }

}

const mapStateToProps = state => {
  return {
    ...pick([
      "isUpdatingEncryptedPrivkey",
      "updateEncryptedPrivkeyErr"
    ], state),
    currentUser: getCurrentUser(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSubmit: params => dispatch(updateEncryptedPrivkey(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdatePassword)

