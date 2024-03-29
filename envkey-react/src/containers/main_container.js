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
  getDecryptedAll,
  getIsDemo,
  getDemoDownloadUrl,
  getIsStartingV2Upgrade,
  getUpgradeToken,
  getEncryptedV2InviteToken,
  getDidFinishV2Upgrade,
  getDidFinishV2OrgUserUpgrade,
  getDidUpgradeV2At,
  getUpgradeV2Error,
  getAcceptV2UpgradeInviteError,
  getCanceledV2Upgrade,
  getClearedV2UpgradeOverlay
} from 'selectors'
import {
  appLoaded,
  fetchCurrentUser,
  selectOrg,
  logout,
  billingUpgradeSubscription,
  resetSession,
  startV2Upgrade
} from 'actions'
import { TrialOverdueContainer, UpgradeOrgStatusContainer, UpgradedOrgContainer, UpgradingOrgContainer } from 'containers'
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
    return !this.props.isDemo &&
           this.props.currentUser.role == "org_owner" &&
           this.props.currentOrg.trialing &&
           this.props.currentOrg.trialDaysRemaining < 15
  }

  _shouldShowV2UpgradeAlert(){
    return this.props.decryptedAll &&
           // this.props.currentUser.role == "org_owner" && // show this to everyone now
          !(this.props.didUpgradeV2At ||
            this.props.didFinishV2Upgrade ||
            this.props.didFinishV2OrgUserUpgrade ||
            this.props.isStartingV2Upgrade ||
            this._shouldShowTrialAlert())
  }

  _shouldRenderOrgUpgradedWarning(){
    const upgradeActive =  this.props.currentOrg.isUpgradingV2At &&
      !this.props.currentOrg.didUpgradeV2At &&
      !this.props.currentOrg.didCancelV2UpgradeAt &&
      !this.props.canceledV2Upgrade

    const shouldShow = (upgradeActive && this.props.currentUser.role != "org_owner") ||
         this.props.didUpgradeV2At ||
        this.props.didFinishV2Upgrade ||
        this.props.didFinishV2OrgUserUpgrade

    return shouldShow;
  }

  _trialOverdue(){
    return this.props.currentOrg.trialing && this.props.currentOrg.trialOverdue
  }

  _classNames(){
    return [
      ("role-" + this.props.currentUser.role),
      (orgRoleIsAdmin(this.props.currentUser.role) ? "is-org-admin" : ""),
      ((this._shouldShowTrialAlert() || this._shouldShowV2UpgradeAlert() || this._shouldRenderOrgUpgradedWarning() || this.props.isDemo) ? "show-bottom-alert" : "")
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

        {this._renderV2UpgradeOverlay()}

        {this._renderV2UpgradeAlert()}

        {this._renderOrgUpgradedWarning()}
      </div>
    }
  }

  _renderV2UpgradeOverlay(){
    if (!this.props.decryptedAll){
      return;
    }

    if (this.props.clearedV2UpgradeOverlay){
      return;
    }

    if (this.props.didUpgradeV2At ||
        this.props.didFinishV2Upgrade ||
        this.props.didFinishV2OrgUserUpgrade){
      return <UpgradedOrgContainer />
    }

    const upgradeActive =  this.props.currentOrg.isUpgradingV2At &&
      !this.props.currentOrg.didUpgradeV2At &&
      !this.props.currentOrg.didCancelV2UpgradeAt &&
      !this.props.canceledV2Upgrade

    const shouldResume = upgradeActive &&  this.props.currentUser.role == "org_owner"

    if (
        (this.props.isStartingV2Upgrade ||
          shouldResume ||
          (this.props.upgradeToken &&
           this.props.encryptedV2InviteToken) ||
          this.props.upgradeV2Error ||
          this.props.acceptV2UpgradeInviteError) && !this.props.canceledV2Upgrade
       ){
      return <UpgradeOrgStatusContainer />
    }

    if (upgradeActive && this.props.currentUser.role != "org_owner"){
      return <UpgradingOrgContainer />
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

  _renderV2UpgradeAlert(){
    if (
        this._shouldShowV2UpgradeAlert()
       ){
      const today = new Date();
      const targetDate = new Date(2023, 3, 28); // Note that months are zero-based, so 3 represents April
      const msPerDay = 24 * 60 * 60 * 1000;
      const numDays = Math.floor((targetDate - today) / msPerDay);

      const isOwner = this.props.currentUser.role == "org_owner";

      return <div className="bottom-alert trial-alert">
        <div><span>Your org is now <strong>read-only.</strong> {isOwner ? "Please upgrade to EnvKey v2 to make changes." : "To make changes, ask your Org Owner to upgrade to EnvKey v2."}</span></div>

        {isOwner ? <button onClick={()=> this.props.startV2Upgrade()}>Upgrade Org</button> : ""}
      </div>
    }
  }

  _renderOrgUpgradedWarning(){
    if (this._shouldRenderOrgUpgradedWarning()){
      return <div className="bottom-alert trial-alert" style={{paddingTop: 20}}>
        <div><span><strong>WARNING:{" "}</strong>this org has been upgraded to EnvKey v2.{" "}<strong>Changes won't be reflected in the v2 org.</strong></span></div>
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
    decryptedAll: getDecryptedAll(state),
    numOrgs: getOrgs(state).length,
    apps: getApps(state),
    users: getUserGroupsByRole(state),
    appLoaded: getAppLoaded(state),
    isLoadingAppState: getIsLoadingAppState(state),
    permissions: getPermissions(state),
    auth: getAuth(state),
    isUpdatingSubscription: getIsUpdatingSubscription(state),
    stripeFormOpened: getStripeFormOpened(state),
    isDemo: getIsDemo(state),
    demoDownloadUrl: getDemoDownloadUrl(state),
    isStartingV2Upgrade: getIsStartingV2Upgrade(state),
    upgradeToken: getUpgradeToken(state),
    encryptedV2InviteToken: getEncryptedV2InviteToken(state),
    didFinishV2Upgrade: getDidFinishV2Upgrade(state),
    didFinishV2OrgUserUpgrade: getDidFinishV2OrgUserUpgrade(state),
    didUpgradeV2At: getDidUpgradeV2At(state),
    upgradeV2Error: getUpgradeV2Error(state),
    acceptV2UpgradeInviteError: getAcceptV2UpgradeInviteError(state),
    canceledV2Upgrade: getCanceledV2Upgrade(state),
    clearedV2UpgradeOverlay: getClearedV2UpgradeOverlay(state)
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
    resetSession: ()=> dispatch(resetSession()),
    startV2Upgrade: ()=> dispatch(startV2Upgrade())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)
