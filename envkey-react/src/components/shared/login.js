import React from 'react'

export default class Login extends React.Component {

  componentDidMount() {
    this.refs.email.focus();
  }

  onSubmit(e){
    e.preventDefault();
    this.props.onSubmit({
      email: this.refs.email.value,
      password: this.refs.password.value
    })
  }

  render(){
    return <form onSubmit={::this.onSubmit}>

      <input ref="email"
             type="email"
             placeholder="Your email"
             required />

      <input ref="password"
             type="password"
             placeholder="Your password (8-256 characters)"
             pattern=".{8,256}"
             required />

      {this.renderSubmit()}
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