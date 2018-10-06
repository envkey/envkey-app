import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import Sidebar from 'components/sidebar'
import Header from 'components/shared/header'
import {
  getAppLoaded,
  getApps,
  getConfigBlocks,
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
  getDecryptedAll,
  getIsDemo,
  getDemoDownloadUrl
} from 'selectors'
import {
  appLoaded,
  fetchCurrentUser,
  selectOrg,
  logout,
  billingUpgradeSubscription,
  resetSession
} from 'actions'
import { TrialOverdueContainer } from '..'
import {orgRoleIsAdmin} from "envkey-client-core/dist/lib/roles"
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
    return !this.props.isDemo &&
           this.props.currentUser.role == "org_owner" &&
           this.props.currentOrg.trialing &&
           this.props.currentOrg.trialDaysRemaining < 15
  }

  _trialOverdue(){
    return this.props.currentOrg.trialing && this.props.currentOrg.trialOverdue
  }

  _classNames(){
    return [
      ("role-" + this.props.currentUser.role),
      (orgRoleIsAdmin(this.props.currentUser.role) ? "is-org-admin" : ""),
      ((this._shouldShowTrialAlert() || this.props.isDemo) ? "show-bottom-alert" : "")
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

        {this._renderDemoCTA()}
      </div>
    }
  }

  _renderDemoCTA(){
    if (this.props.isDemo){
      return <div className="bottom-alert demo-cta">
        <div><span><strong>This is a live demo.</strong> You shouldn't enter any real secrets. To start a free trial, download the EnvKey App.</span></div>

        <a className="button" href={this.props.demoDownloadUrl} target="_blank" >Download </a>
      </div>
    }
  }

  _renderTrialAlert(){
    if (this._shouldShowTrialAlert()){
      if (this.state.willShowUpgradeForm || this.props.isUpdatingSubscription){
        return <div className="bottom-alert trial-alert"><Spinner /></div>
      }

      return <div className="bottom-alert trial-alert">
        <div>{this._renderTrialAlertCopy()}</div>

        <button onClick={::this._onUpgradeSubscription}>Upgrade Now </button>
      </div>
    }
  }

  _renderTrialAlertCopy(){
    if (this.props.currentOrg.trialDaysRemaining > 28){
      return <span> An ENVKEY was integrated, so {this.props.currentOrg.name}'s <strong>Free Trial</strong> has started. <strong>{this.props.currentOrg.trialDaysRemaining} days</strong> are left. </span>
    } else {
      return <span> {this.props.currentOrg.name}'s <strong>Free Trial</strong> has <strong>{this.props.currentOrg.trialDaysRemaining} days</strong> left. </span>
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
    decryptedAll: getDecryptedAll(state),
    numOrgs: getOrgs(state).length,
    apps: getApps(state),
    configBlocks: getConfigBlocks(state),
    users: getUserGroupsByRole(state),
    appLoaded: getAppLoaded(state),
    isLoadingAppState: getIsLoadingAppState(state),
    permissions: getPermissions(state),
    auth: getAuth(state),
    isUpdatingSubscription: getIsUpdatingSubscription(state),
    stripeFormOpened: getStripeFormOpened(state),
    isDemo: getIsDemo(state),
    demoDownloadUrl: getDemoDownloadUrl(state)
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
    },
    resetSession: ()=> dispatch(resetSession())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)
