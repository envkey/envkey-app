import React from 'react'
import {Link} from 'react-router'

export default class Login extends React.Component {

  componentDidMount() {
    this.refs.email.focus()
    this.props.onLoad()
  }

  onSubmit(e){
    e.preventDefault();
    this.props.onSubmit({
      email: this.refs.email.value,
      password: this.refs.password.value
    })
  }

  render(){
    return <form className="auth-form login" onSubmit={::this.onSubmit}>
      <fieldset>
        <input ref="email"
               type="email"
               placeholder="Your email"
               required />
      </fieldset>

      <fieldset>
        <input ref="password"
               type="password"
               placeholder="Your password (10-256 characters)"
               pattern=".{10,256}"
               required />
      </fieldset>

      <fieldset>{this.renderSubmit()}</fieldset>

      <div className="auth-toggle">
        <p> Don't have an account? </p>
        <Link to="/signup"> Sign Up </Link>
      </div>
    </form>
  }

  renderSubmit(){
    if(this.props.isAuthenticating){
      return <h5>Submitting...</h5>
    } else {
      return <button>Login</button>
    }
  }

}