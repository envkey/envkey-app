import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import Sidebar from 'components/sidebar'
import Header from 'components/shared/header'
import {
  getAppLoaded,
  getApps,
  getOrgs,
  getUserGroupsByRole,
  getIsLoadingAppState,
  getCurrentUser,
  getAuth,
  getCurrentUserErr,
  getPermissions,
  getCurrentOrg,
  getCurrentOrgSlug,
  getIsUpdatingSubscription,
  getStripeFormOpened,
  getIsExceedingFreeTier
} from 'selectors'
import {
  appLoaded,
  fetchCurrentUser,
  selectOrg,
  logout,
  billingUpgradeSubscription
} from 'actions'
import { TrialOverdueContainer } from 'containers'
import {orgRoleIsAdmin} from 'lib/roles'
import R from 'ramda'
import {openLinkExternal} from 'lib/ui'
import Spinner from 'components/shared/spinner'

const appStateLoaded = (props)=>{
  return !props.isLoadingAppState &&
         props.currentUser &&
         props.currentOrg
}

const ensureCurrentUser = (props)=>{
  if(!props.auth){
    props.logout()
    return
  }
  if(props.isLoadingAppState)return
  const orgSlug = props.params.orgSlug.toLowerCase()
  //avoid request loop on failure
  if(props.currentUserErr && orgSlug == props.currentOrgSlug)return

  if(props.currentOrgSlug && props.currentOrgSlug != orgSlug){
    props.selectOrg(orgSlug)
  }

  if(appStateLoaded(props)){
    if(!props.appLoaded)props.onLoad()
  } else if(!appStateLoaded(props)){
    props.fetchCurrentUser()
  }
}

class Main extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      willShowUpgradeForm: false
    }
  }

  componentDidMount(){
    ensureCurrentUser(this.props)
  }

  componentWillReceiveProps(nextProps) {
    ensureCurrentUser(nextProps)

    if (nextProps.stripeFormOpened && this.state.willShowUpgradeForm){
      this.setState({willShowUpgradeForm: false})
    }
  }

  _onUpgradeSubscription(){
    this.setState({willShowUpgradeForm: true})
    this.props.upgradeSubscription()
  }

  _shouldShowTrialAlert(){
    return this.props.currentUser.role == "org_owner" &&
           this.props.currentOrg.trialing &&
           this.props.isExceedingFreeTier &&
           this.props.currentOrg.trialDaysRemaining <= 7
  }

  _trialOverdue(){
    console.log(this.props)
    return this.props.currentOrg.trialOverdue &&
           this.props.isExceedingFreeTier
  }

  _classNames(){
    return [
      ("role-" + this.props.currentUser.role),
      (orgRoleIsAdmin(this.props.currentUser.role) ? "is-org-admin" : ""),
      (this._shouldShowTrialAlert() ? "show-trial-alert" : "")
    ]
  }

  render(){
    if (appStateLoaded(this.props)){
      return <div className={this._classNames().join(" ")}>{this._renderContents()}</div>
    } else {
      return <div></div>
    }
  }

  _renderContents(){
    if (this._trialOverdue() && !this.props.location.pathname.endsWith("/downgrade_removal")){
      return <TrialOverdueContainer />
    } else {
      return <div>
        <Header />

        <Sidebar {...this.props} />

        {this.props.children}

        {this._renderTrialAlert()}
      </div>
    }
  }

  _renderTrialAlert(){
    if (this._shouldShowTrialAlert()){
      if (this.state.willShowUpgradeForm || this.props.isUpdatingSubscription){
        return <div className="trial-alert"><Spinner /></div>
      }

      return <div className="trial-alert">
        <div>
          <span>Your Free Trial has <strong>{this.props.currentOrg.trialDaysRemaining} days</strong> remaining. </span>
          <span>{this.props.currentOrg.name} currently exceeds the <a href="https://www.envkey.com/pricing" target="__blank" onClick={openLinkExternal}>Free Tier limits.</a></span>
        </div>

        <button onClick={::this._onUpgradeSubscription}>Upgrade Now </button>
      </div>
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...R.pick(["route", "params", "location"], ownProps),
    currentOrgSlug: getCurrentOrgSlug(state),
    currentUser: getCurrentUser(state),
    currentUserErr: getCurrentUserErr(state),
    currentOrg: getCurrentOrg(state),
    numOrgs: getOrgs(state).length,
    apps: getApps(state),
    users: getUserGroupsByRole(state),
    appLoaded: getAppLoaded(state),
    isLoadingAppState: getIsLoadingAppState(state),
    permissions: getPermissions(state),
    auth: getAuth(state),
    isUpdatingSubscription: getIsUpdatingSubscription(state),
    stripeFormOpened: getStripeFormOpened(state),
    isExceedingFreeTier: getIsExceedingFreeTier(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLoad: ()=> dispatch(appLoaded()),
    fetchCurrentUser: ()=> dispatch(fetchCurrentUser()),
    selectOrg: (slug)=> dispatch(selectOrg(slug)),
    upgradeSubscription: ()=> dispatch(billingUpgradeSubscription()),
    logout: ()=> {
      dispatch(push("/home"))
      dispatch(logout())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)
