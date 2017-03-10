import React from 'react'
import { connect } from 'react-redux'
import { register, appLoaded } from 'actions'
import {Link} from 'react-router'
import R from 'ramda'

class Registration extends React.Component {

  componentDidMount() {
    this.refs.orgName.focus()
    this.props.onLoad()
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
    return <form className="auth-form signup" onSubmit={::this.onSubmit}>
      <h2>Create your organization.</h2>

      <fieldset>
        <input ref="orgName"
               placeholder="Organization name"
               required />
      </fieldset>

      <fieldset>
        <input ref="firstName"
               placeholder="Your first name"
               required />
      </fieldset>

      <fieldset>
        <input ref="lastName"
               placeholder="Your last name"
               required />
      </fieldset>

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

      {this._renderSubmit()}

      <div className="auth-toggle">
        <p> Already have an account? </p>
        <Link to="/login"> Login </Link>
      </div>
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
    onLoad: ()=> dispatch(appLoaded()),
    onSubmit: (params) => dispatch(register(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Registration)

