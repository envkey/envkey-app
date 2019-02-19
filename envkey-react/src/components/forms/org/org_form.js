import React from 'react'
import PasswordInput from 'components/shared/password_input'
import PasswordCopy from 'components/shared/password_copy'
import SmallLoader from 'components/shared/small_loader'

const initialState = () => ({
  name: "",
  passphrase: "",
  passphraseValid: false,
  passphraseScore: null,
  passphraseFeedback: null
})

export default class OrgForm extends React.Component {

  constructor(props){
    super(props)
    this.state = initialState()
  }

  componentDidMount(){
    this.refs.name.focus()
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit({
      org: {name: this.state.name},
      passphrase: this.state.passphrase
    })
  }

  render(){
    return (
      <form ref="form"
            className="object-form org-form"
            onSubmit={this._onSubmit.bind(this)}>

        <fieldset>
          <input type="text"
                className="org-name"
                disabled={this.props.isSubmitting}
                placeholder="Organization Name"
                value={this.state.name}
                onChange={(e)=> this.setState({name: e.target.value})}
                ref="name"
                required />
        </fieldset>

        <fieldset>
          <PasswordInput
            confirm={true}
            disabled={this.props.isSubmitting}
            value={this.state.passphrase}
            validateStrength={true}
            valid={this.state.passphraseValid}
            score={this.state.passphraseScore}
            feedback={this.state.passphraseFeedback}
            onChange={(val, valid, score, feedback) => this.setState({
              passphrase:val,
              passphraseValid:valid,
              passphraseScore:score,
              passphraseFeedback:feedback
            })}
          />
        </fieldset>

        <PasswordCopy />

        {this._renderSubmit()}
      </form>
    )
  }

  _renderSubmit(){
    return <button disabled={this.props.isSubmitting || !this.state.passphraseValid}>
      <span>Create Organization</span>
    </button>
  }
}