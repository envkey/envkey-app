import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { push } from 'react-router-redux'
import {
  startExternalAuthSession
} from 'actions'
import {

} from 'selectors'
import Spinner from 'components/shared/spinner'
import { OnboardOverlay } from 'components/onboard'


class AuthMethods extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      authenticating: false,
      selectedProvider: null
    }
  }

  componentWillReceiveProps(nextProps){
    if (this.state.authenticating && nextProps.fetchVerifiedExternalAuthSessionErr){
      this.setState({authenticating: false})
    }
  }

  _getOnSelect(authMethod, provider){
    return e => {
      if (["email", "oauth_cloud"].includes(authMethod)){
        this.props.onSubmit({authMethod, provider, authType: this.props.params.authType})
        if (authMethod != "email"){
          this.setState({authenticating: true})
        }
      } else {
        this.setState({selectedProvider: provider})
      }
    }
  }

  _onSubmitAuthSettings(e){

  }

  _title(){
    return this.props.params.authType == "sign_in" ? "Sign In" : "Sign Up"
  }

  render() {
    return <OnboardOverlay>
      <div>
        <h1><em>{this._title()}</em></h1>
        <p className="small">
          {this.state.authenticating ? "Authenticating..." : "Choose an authentication method." }
        </p>
        <div className="onboard-auth-form auth-methods">
          {this._renderContent()}
          {this._renderBackLink()}
        </div>
      </div>
    </OnboardOverlay>
  }

  _renderContent() {
    if (this.state.authenticating){
      return <div>
        <Spinner />
      </div>
    } else {
      return <div>
        <div className="email" onClick={this._getOnSelect("email", "email")}>Email</div>

        <div className="github" onClick={this._getOnSelect("oauth_cloud", "github")}>Github Cloud</div>
        <div className="gitlab" onClick={this._getOnSelect("oauth_cloud", "gitlab")}>Gitlab Cloud</div>
        <div className="google" onClick={this._getOnSelect("oauth_cloud", "google")}>Google</div>
        <div className="okta" onClick={this._getOnSelect("oauth_cloud", "okta")}>Okta</div>

        <div className="github-hosted" onClick={this._getOnSelect("oauth_hosted", "github_hosted")}>Github Enterprise</div>
        <div className="gitlab-hosted" onClick={this._getOnSelect("oauth_hosted", "gitlab_hosted")}>Gitlab Self-Hosted</div>
        <div className="azure" onClick={this._getOnSelect("oauth_azure", "azure")}>Azure AD</div>

        <div className="saml" onClick={this._getOnSelect("saml", "saml")}>SAML 2.0</div>
        <div className="ldap" onClick={this._getOnSelect("ldap", "ldap")}>LDAP</div>
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
    fetchVerifiedExternalAuthSessionErr: state.fetchVerifiedExternalAuthSessionErr
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSubmit: (props)=>{
      const { authType, authMethod, provider, providerSettings } = props
      if (authMethod == "email"){
        dispatch(push("/email_auth"))
      } else {
        dispatch(startExternalAuthSession(props))
      }
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthMethods)

