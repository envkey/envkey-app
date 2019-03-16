import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { push } from 'react-router-redux'
import {
  verifyEmailRequest,
  startExternalAuthSession,
  login,
} from 'actions'
import {

} from 'selectors'
import Spinner from 'components/shared/spinner'
import { OnboardOverlay } from 'components/onboard'

import { AUTH_PROVIDERS } from 'components/shared/i18n'

class AuthMethods extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      selectedProvider: null
    }
  }

  _getOnSelect(authMethod, provider){
    return e => {
      if (["email", "oauth_cloud"].includes(authMethod)){
        this.props.onSubmit({authMethod, provider, authType: this.props.params.authType})
      } else {
        this.setState({selectedProvider: provider})
      }
    }
  }

  _onSubmitAuthSettings(e){

  }

  _title() {
    return this.props.params.authType == "sign_in" ? "Sign In" : "Sign Up"
  }

  render() {
    return <OnboardOverlay>
      <div>
        <h1><em>{this._title()}</em></h1>
        {this._renderFetchVerifiedExternalAuthSessionErr()}
        <p className="small">
          {this.props.isVerifyingExternalAuth ? "Authenticating..." : "Choose an authentication method." }
        </p>
        <div className="onboard-auth-form auth-methods">
          {this._renderContent()}
          {this._renderBackLink()}
        </div>
      </div>
    </OnboardOverlay>
  }


  _authLink(data) {
    const { id, uid, provider, userProvider, userId, email, verifiedAt } = data

    const newProvider = userProvider || provider || 'email'
    const authType = userProvider == null ? 'sign_up' : 'sign_in'
    const verificationType = userProvider == null ? 'registration' : 'sign_in'

    const providerTitle = AUTH_PROVIDERS[newProvider || 'email'] || '[unknown provider]'
    const actionTitle = authType === 'sign_in' ? 'In' : 'Up'
    const linkTextHTML = `Sign ${actionTitle} Via ${providerTitle}`.replace(/ /g, '&nbsp;')

    let linkURL
    if (verifiedAt && !userId) {
      linkURL = '/register'
    } else {
      const linkPrefix = newProvider === 'email' ? 'email_auth' : 'auth_methods'
      linkURL = `/${linkPrefix}/${authType}`
    }

    return h(Link, {
      to: linkURL,
      dangerouslySetInnerHTML: {__html: linkTextHTML},
      onClick: () => {
        if (newProvider === 'email') {
          // Start the email verification request and redirect to email auth
          this.props.onVerifyEmail({ email, verificationType })
          return
        }

        if (verifiedAt) {
          // If the current external auth session is already verified and there is a user,
          // then we can login.
          if (userId) {
            this.props.onLogin({
              externalAuthSessionId: id,
              provider,
              uid
            })
          }

          // If no user id, then the link URL is /register
          return
        }

        // If there is no verified OAuth session, then fall back to the default
        // onSubmit handler to start a new session.
        this.props.onSubmit({
          authType,
          authMethod: newProvider === 'email' ? 'email' : "oauth_cloud",
          provider: newProvider })
      }
    })
  }

  _renderFetchVerifiedExternalAuthSessionErr() {
    const { fetchVerifiedExternalAuthSessionErr: error } = this.props
    if (!error) return null

    if (error.response && error.response.data) {
      const { data } = error.response
      if (data.errorReason) {
        return h.p(".error", [h.span(data.errorReason), ' ', this._authLink(data)])
      }
    }

    return h.p(".error", [
      "Oops! The request failed. Check your internet connection and try again. " +
      "If it's still not working, contact support: support@envkey.com"
    ])
  }


  _renderContent() {
    if (this.props.isVerifyingExternalAuth){
      return <div>
        <Spinner />
      </div>
    } else {
      return <div>
        <div className="auth-method email" onClick={this._getOnSelect("email", "email")}>Email</div>

        <div className="auth-method github" onClick={this._getOnSelect("oauth_cloud", "github")}>Github Cloud</div>
        <div className="auth-method gitlab" onClick={this._getOnSelect("oauth_cloud", "gitlab")}>Gitlab Cloud</div>
        <div className="auth-method google" onClick={this._getOnSelect("oauth_cloud", "google")}>Google</div>
        <div className="auth-method okta" onClick={this._getOnSelect("oauth_cloud", "okta")}>Okta</div>

        <div className="auth-method github-hosted" onClick={this._getOnSelect("oauth_hosted", "github_hosted")}>Github Enterprise</div>
        <div className="auth-method gitlab-hosted" onClick={this._getOnSelect("oauth_hosted", "gitlab_hosted")}>Gitlab Self-Hosted</div>
        <div className="auth-method azure" onClick={this._getOnSelect("oauth_azure", "azure")}>Azure AD</div>

        <div className="auth-method saml" onClick={this._getOnSelect("saml", "saml")}>SAML 2.0</div>
        <div className="auth-method ldap" onClick={this._getOnSelect("ldap", "ldap")}>LDAP</div>
      </div>
    }

  }

  _renderBackLink() {
    return <Link className="back-link" to="/home">
      <span className="img">←</span>
      <span>Back To Home</span>
    </Link>
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    isVerifyingExternalAuth: state.isVerifyingExternalAuth,
    fetchVerifiedExternalAuthSessionErr: state.fetchVerifiedExternalAuthSessionErr
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onVerifyEmail: (p) => {
      dispatch(verifyEmailRequest(p))
      dispatch(push(`/email_auth/${authType}`))
    },
    onSubmit: (props) => {
      const { authType, authMethod, provider, providerSettings } = props
      if (authMethod == "email"){
        dispatch(push(`/email_auth/${authType}`))
      } else {
        dispatch(startExternalAuthSession(props))
      }
    },
    onLogin: (p) => {
      dispatch(login(p))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthMethods)
