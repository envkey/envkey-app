import React from 'react'
import { connect } from 'react-redux'
import {appLoaded, acceptInvite} from 'actions'
import R from 'ramda'
import {Base64} from 'js-base64'

class AcceptInvite extends React.Component {

  componentDidMount() {
    this.refs.password.focus()
    this.props.onLoad()
  }

  onSubmit(e){
    e.preventDefault();
    this.props.onSubmit({
      password: this.refs.password.value,
      invitationToken: this.props.params.token,
      email: Base64.decode(this.props.params.emailbs64)
    })
  }

  render(){
    return <form onSubmit={::this.onSubmit}>
      <h2>Welcome to Envkey!</h2>
      <p>Choose a password to login</p>
      <input ref="password"
             type="password"
             defaultValue="password"
             placeholder="Your password (10-256 characters)"
             pattern=".{10,256}"
             required />

      {this._renderSubmit()}
    </form>
  }

  _renderSubmit(){
    if(this.props.isAuthenticating){
      return <h5>Submitting...</h5>
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

