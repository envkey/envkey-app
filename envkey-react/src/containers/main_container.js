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
  getCurrentOrgSlug
} from 'selectors'
import {appLoaded, fetchCurrentUser, selectOrg, logout} from 'actions'
import {orgRoleIsAdmin} from 'lib/roles'
import R from 'ramda'

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

  componentDidMount(){
    ensureCurrentUser(this.props)
  }

  componentWillReceiveProps(nextProps) {
    ensureCurrentUser(nextProps)
  }

  _classNames(){
    return [
      ("role-" + this.props.currentUser.role),
      (orgRoleIsAdmin(this.props.currentUser.role) ? "is-org-admin" : "")
    ]
  }

  render(){
    if (appStateLoaded(this.props)){

      return <div className={this._classNames().join(" ")}>
        <Header />

        <Sidebar {...this.props} />

        {this.props.children}

      </div>
    } else {
      return <div></div>
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...R.pick(["route", "params"], ownProps),
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
    auth: getAuth(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLoad: ()=> dispatch(appLoaded()),
    fetchCurrentUser: ()=> dispatch(fetchCurrentUser()),
    selectOrg: (slug)=> dispatch(selectOrg(slug)),
    logout: ()=> {
      dispatch(push("/home"))
      dispatch(logout())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)
