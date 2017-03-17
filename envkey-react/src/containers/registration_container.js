import React from 'react'
import { connect } from 'react-redux'
import { register, appLoaded } from 'actions'
import {Link} from 'react-router'
import R from 'ramda'
import PasswordInput from 'components/shared/password_input'
import {imagePath} from 'lib/ui'

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
      password: this.refs.password.val(),
      org: {name: this.refs.orgName.value}
    })
  }

  render(){
    return <div className="full-overlay">
      <form className="auth-form signup" onSubmit={::this.onSubmit}>
        <div className="logo"> <img src={imagePath("envkey-logo.svg")} /> </div>
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
          <PasswordInput ref="password" />
        </fieldset>

        <fieldset>
          {this._renderSubmit()}
        </fieldset>

        <div className="auth-toggle">
          <span> Already have an account? </span>
          <Link to="/login"> Login </Link>
        </div>
      </form>
    </div>
  }

  _renderSubmit(){
    if(this.props.isAuthenticating){
      return <button disabled={true}>Submitting... </button>
    } else {
      return <button>Create Organization</button>
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

