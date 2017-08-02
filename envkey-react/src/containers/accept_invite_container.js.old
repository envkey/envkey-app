import React from 'react'
import { connect } from 'react-redux'
import {appLoaded, acceptInvite} from 'actions'
import R from 'ramda'
import {Base64} from 'js-base64'
import PasswordInput from 'components/shared/password_input'
import {imagePath} from 'lib/ui'

class AcceptInvite extends React.Component {

  componentDidMount() {
    this.refs.password.focus()
    this.props.onLoad()
  }

  onSubmit(e){
    e.preventDefault();
    this.props.onSubmit({
      password: this.refs.password.val(),
      invitationToken: this.props.params.token,
      email: Base64.decode(this.props.params.emailbs64)
    })
  }

  render(){
    return <div className="full-overlay">
      <form className="auth-form accept-invite" onSubmit={::this.onSubmit}>
        <div className="logo"> <img src={imagePath("envkey-logo.svg")} /> </div>
        <div className="msg">
          Welcome! Choose a password to login.
        </div>
        <fieldset>
          <PasswordInput ref="password" />
        </fieldset>

        <fieldset>{this._renderSubmit()}</fieldset>
      </form>
    </div>
  }

  _renderSubmit(){
    if(this.props.isAuthenticating){
      return <button disabled={true}>Submitting... </button>
    } else {
      return <button>Login</button>
    }
  }
}

const mapStateToProps = state => R.pick(['isAuthenticating'], state)

const mapDispatchToProps = dispatch => {
  return {
    onLoad: ()=> dispatch(appLoaded()),
    onSubmit: (params) => dispatch(acceptInvite(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AcceptInvite)

