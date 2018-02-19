import React from 'react'
import zxcvbn from 'zxcvbn'

const scoreValid = score => score && score > 3

export default class PasswordInput extends React.Component {

  val(){
    return this.refs.input.value
  }

  focus(){
    this.refs.input.focus()
  }

  _onChange(e){
    const val = this.refs.input.value,
          confirmVal = this.props.confirm ? this.refs.confirm.value : "",
          confirmValid = !this.props.confirm || val == confirmVal

    if(!this.props.validateStrength){
      if(this.props.onChange)this.props.onChange(val, val.length >= 10 && confirmValid)
      return
    }

    if (val.length < 10){
      if(this.props.onChange)this.props.onChange(val, false)
      return
    }

    const {score, feedback} = zxcvbn(val.substr(0,20), [...this.props.strengthUserInputs, "envkey", "passphrase"])

    if(this.props.onChange){
      this.props.onChange(val, (scoreValid(score) && confirmValid), score, feedback)
      return
    }
  }


  render(){
    return <div className="password-input">

        <input  value={this.props.value}
                onChange={::this._onChange}
                disabled={this.props.disabled}
                ref="input"
                type="password"
                placeholder={this.props.placeholder || "Master encryption passphrase (10-256 characters)"}
                pattern=".{10,256}"
                required />

        {this._renderConfirm()}

        {this._renderStrength()}
    </div>
  }

  _renderStrength(){
    if (!this.props.disabled && this.props.validateStrength && this.props.value.length >= 10){
      let msg
      const val = this.refs.input.value,
            confirmVal = this.props.confirm ? this.refs.confirm.value : "",
            confirmValid = !this.props.confirm || val == confirmVal

      const {score, feedback: {suggestions, warning}} = this.props

      if (scoreValid(score) && !confirmValid && confirmVal.length >= 10){
        msg = "Confirmation doesn't match."
      } else {
        const type = ["horrendously weak", "fairly weak", "weak", "mediocre", "strong"][score]

        msg = "Seems like a " + type + " passphrase."

        if (warning){
          msg += " " + warning + "."
        }

        if (suggestions && suggestions.length){
          msg += " " + suggestions.join(" ")
        }
      }

      return <span className={`password-strength score-${score}`}>{msg}</span>
    }
  }

  _renderConfirm(){
    if (this.props.confirm){
      return <input
        value={this.props.value ? undefined : ""}
        className="confirm-passphrase"
        onChange={::this._onChange}
        disabled={this.props.disabled || (this.props.validateStrength && !scoreValid(this.props.score))}
        ref="confirm"
        type="password"
        placeholder="Confirm passphrase (10-256 characters)"
        pattern=".{10,256}"
        required
      />
    }
  }
}

