import React from 'react'
import {Link} from 'react-router'
import { connect } from 'react-redux'
import {login, appLoaded} from 'actions'
import R from 'ramda'
import PasswordInput from 'components/shared/password_input'
import {imagePath} from 'lib/ui'

class Login extends React.Component {

  componentDidMount() {
    this.refs.email.focus()
    this.props.onLoad()
  }

  onSubmit(e){
    e.preventDefault();
    this.props.onSubmit({
      email: this.refs.email.value,
      password: this.refs.password.val()
    })
  }

  render(){
    return <div className="full-overlay">
      <form className="auth-form login" onSubmit={::this.onSubmit}>
        <div className="logo"> <img src={imagePath("envkey-logo.svg")} /> </div>
        <fieldset>
          <input ref="email"
                 type="email"
                 placeholder="Your email"
                 required />
        </fieldset>

        <fieldset>
          <PasswordInput ref="password" />
        </fieldset>

        <fieldset>{this._renderSubmit()}</fieldset>

        <div className="auth-toggle">
          <span> Don't have an account? </span>
          <Link to="/signup"> Sign Up </Link>
        </div>
      </form>
    </div>
  }

  _renderSubmit(){
    if(this.props.isAuthenticating){
      return <button disabled={true}>Submitting...</button>
    } else {
      return <button>Login</button>
    }
  }

}

const mapStateToProps = state => R.pick(['isAuthenticating'], state)

const mapDispatchToProps = dispatch => {
  return {
    onLoad: ()=> dispatch(appLoaded()),
    onSubmit: (params) => dispatch(login(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)