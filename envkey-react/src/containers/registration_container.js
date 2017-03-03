import React from 'react'
import { connect } from 'react-redux'
import { register } from 'actions'
import R from 'ramda'

class Registration extends React.Component {

  componentDidMount() {
    this.refs.orgName.focus()
  }

  onSubmit(e){
    e.preventDefault()
    this.props.onSubmit({
      firstName: this.refs.firstName.value,
      lastName: this.refs.lastName.value,
      email: this.refs.email.value,
      password: this.refs.password.value,
      org: {name: this.refs.orgName.value}
    })
  }

  render(){
    return <form onSubmit={::this.onSubmit}>
      <h2>Create your organization.</h2>

      <input ref="orgName"
             placeholder="Organization name"
             required />

      <input ref="firstName"
             placeholder="Your first name"
             required />

      <input ref="lastName"
             placeholder="Your last name"
             required />

      <input ref="email"
             type="email"
             placeholder="Your email"
             required />

      <input ref="password"
             type="password"
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
      return <button>Create</button>
    }
  }
}

const mapStateToProps = state => R.pick(['isAuthenticating'], state)

const mapDispatchToProps = dispatch => {
  return {
    onSubmit: (params) => dispatch(register(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Registration)

