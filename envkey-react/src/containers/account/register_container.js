import React from 'react'
import R from 'ramda'
import { connect } from 'react-redux'
import h from "lib/ui/hyperscript_with_helpers"
import {
  resetVerifyEmail,
  register
} from 'actions'
import Spinner from 'components/shared/spinner'
import { OnboardOverlay } from 'components/onboard'
import { pick } from 'envkey-client-core/dist/lib/utils/object'
import PasswordInput from 'components/shared/password_input'
import PasswordCopy from 'components/shared/password_copy'
import { Link } from 'react-router'

class Register extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      firstName: (this.props.verifiedExternalAuthSession ? this.props.verifiedExternalAuthSession.suggestFirstName : ""),
      lastName: (this.props.verifiedExternalAuthSession ? this.props.verifiedExternalAuthSession.suggestLastName : ""),
      orgName: "",
      password: "",
      passwordValid: false,
      passwordScore: null,
      passwordFeedback: null,
      heardAbout: ""
    }
  }

  componentDidMount(){
    this.refs.orgName.focus()
  }

  _onRegister(e) {
    e.preventDefault()
    const externalAuthSession = this.props.verifiedExternalAuthSession || {}
    this.props.onRegister({
      ...R.pick(["firstName", "lastName"], this.state),
      ...R.pick(["email", "emailVerificationCode"], this.props),
      ...R.pick(["email", "provider", "uid"], externalAuthSession),
      externalAuthSessionId: externalAuthSession.id,
      passphrase: this.state.password,
      org: { name: this.state.orgName, heardAbout: this.state.heardAbout },
    })
  }

  _onReset() {
    if (this.props.emailVerificationCode){
      this.props.onReset()
    }
  }

  _createOrgEnabled() {
    return this.state.firstName && this.state.lastName && this.state.orgName && this.state.passwordValid
  }

  render() {
    return h(OnboardOverlay, [
      h.div([
        h.div(".onboard-auth-form.login-register", [
          h.h1(["Create ", h.em("Organization")]),
          this._renderContent(),
          this._renderBackLink()
        ])
      ])
    ])
  }

  _renderContent(){
    return <div>{this._renderRegister()}</div>
  }

  _renderRegister() {
    return h.div(".register-form", [

      this._renderRegisterCopy(),

      h.form({ onSubmit: :: this._onRegister }, [
        h.fieldset(".org-name", [
          h.input({
            type: "text",
            disabled: this.props.isAuthenticating || this.props.currentUser,
            ref: "orgName",
            placeholder: "Organization name",
            required: true,
            value: this.state.orgName,
            onChange: (e) => this.setState({ orgName: e.target.value })
          })
        ]),

        h.fieldset(".first-name", [
          h.input({
            type: "text",
            disabled: this.props.isAuthenticating || this.props.currentUser,
            placeholder: "Your first name",
            required: true,
            value: this.state.firstName,
            onChange: (e) => this.setState({ firstName: e.target.value })
          })
        ]),

        h.fieldset(".last-name", [
          h.input({
            type: "text",
            disabled: this.props.isAuthenticating || this.props.currentUser,
            placeholder: "Your last name",
            required: true,
            value: this.state.lastName,
            onChange: (e) => this.setState({ lastName: e.target.value })
          })
        ]),

        h.fieldset(".heard-about", [
          h.select({
            onChange: (e) => this.setState({ heardAbout: e.target.value })
          }, [
              h.option({ disabled: true, selected: true }, ["How did you find out about EnvKey?"]),
              h.option("Friend or colleague"),
              h.option("Google search"),
              h.option("HackerNews"),
              h.option("Reddit"),
              h.option("Twitter"),
              h.option("Another website"),
              h.option("Facebook Ad"),
              h.option("Google Ad"),
              h.option("Reddit Ad"),
              h.option("Other")
            ])
        ]),

        h.fieldset(".passphrase", [
          h(PasswordInput, {
            type: "text",
            confirm: true,
            disabled: this.props.isAuthenticating || this.props.currentUser,
            value: this.state.password,
            validateStrength: true,
            valid: this.state.passwordValid,
            score: this.state.passwordScore,
            feedback: this.state.passwordFeedback,
            strengthUserInputs: [this.state.orgName, this.state.firstName, this.state.lastName, this.state.email],
            onChange: (val, valid, score, feedback) => this.setState({
              password: val,
              passwordValid: valid,
              passwordScore: score,
              passwordFeedback: feedback
            })
          })
        ]),

        h.fieldset([
          this._renderRegisterSubmit()
        ]),
      ]),

      h(PasswordCopy)
    ])
  }

  _renderRegisterSubmit() {
    if (this.props.isAuthenticating || this.props.currentUser) {
      return h(Spinner)
    } else {
      return h.button({ disabled: !this._createOrgEnabled() }, "Create Organization")
    }
  }

  _renderRegisterCopy() {
    if (this.props.authError) {
      return h.p(".error", [`Oops! That didn't work. Check your connection and try again. If it's still not working, contact support@envkey.com`])
    } else {
      return h.div(".msg", [
        h.p("A few more details are needed to create your organization."),
      ])
    }
  }

  _renderBackLink() {
    return <Link className="back-link" to="/home">
      <span className="img">←</span>
      <span>Back To Home</span>
    </Link>
  }
}

const mapStateToProps = state => {
  return {
    ...pick([
      "isAuthenticating",
      "authError",
      "emailVerificationCode",
      "verifiedExternalAuthSession"
    ], state),
    email: state.verifyingEmail
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onReset: () => dispatch(resetVerifyEmail()),
    onRegister: p => dispatch(register(p))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Register)

