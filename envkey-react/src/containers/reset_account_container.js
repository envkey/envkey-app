import React from 'react'
import R from 'ramda'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import {
  accountResetOptionsRequest,
  removeObject
} from 'actions'
import {
  getResetAccountOptions,
  getCurrentUser,
  getOrgsBySlug,
  getIsRemoving
} from 'selectors'
import Spinner from 'components/shared/spinner'
import {OnboardOverlay} from 'components/onboard'


class ResetAccount extends React.Component {

  componentDidMount(){
    this.props.load()
  }

  render(){
    return <OnboardOverlay>
      <div>
        <h1><em>Reset Account</em></h1>
        <p className="small">
          To regain access, you first need to delete your account. <br/>
          Next, ask an admin of each org you're a member of to re-invite you. <br/>
          <strong>Here are the users who can re-invite you:</strong>
        </p>
        <div className="onboard-auth-form reset-account">
          {this._renderContent()}
          {this._renderDeleteAccount()}
          {this._renderBackLink()}
        </div>
      </div>
    </OnboardOverlay>
  }

  _renderContent(){
    if (this.props.accountResetOptions){
      return <div className="org-sections">
        {R.toPairs(this.props.accountResetOptions).map(::this._renderOrgSection)}
      </div>
    } else {
      return <Spinner />
    }
  }

  _renderOrgSection([slug, users]){
    const org = this.props.orgsBySlug[slug]

    return <section className="org-section">
      <h3>{org.name}</h3>
      {this._renderOrgUsers(users)}
    </section>
  }

  _renderOrgUsers(users){
    if (users.length){
      return <div className="org-users">
        {users.map(userStr => <div className="org-user">{userStr}</div>)}
      </div>
    } else {
      return <div className="org-users no-users">
        <span>No users can re-invite you.</span>
      </div>
    }
  }

  _renderDeleteAccount(){
    if (this.props.accountResetOptions){
      if (this.props.isDeletingAccount){
        return <div className="delete-account">
          <Spinner />
        </div>
      } else {
        return <div className="delete-account">
          <button onClick={()=> this.props.deleteAccount(this.props.currentUser.id)}>Delete Account</button>
          <small>This can't be undone.</small>
        </div>
      }
    }
  }

  _renderBackLink(){
    return <Link className="back-link" to="/home">
      <span className="img">←</span>
      <span>Back To Home</span>
    </Link>
  }
}

const mapStateToProps = (state, ownProps) => {
  const currentUser = getCurrentUser(state)
  return {
    currentUser,
    accountResetOptions: getResetAccountOptions(state),
    isDeletingAccount: getIsRemoving(currentUser.id, state),
    orgsBySlug: getOrgsBySlug(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    load: ()=> dispatch(accountResetOptionsRequest()),
    deleteAccount: (currentUserId)=> dispatch(removeObject({
      objectType: "user",
      targetId: currentUserId
    }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetAccount)

