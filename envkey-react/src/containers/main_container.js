import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import Sidebar from 'components/sidebar'
import Header from 'components/shared/header'
import { getApps,
         getServices,
         getUserGroupsByRole,
         getIsLoadingAppState,
         getCurrentUser,
         getCurrentUserErr,
         getPermissions,
         getCurrentOrg,
         getCurrentOrgSlug } from 'selectors'
import {fetchCurrentUser, selectOrg, logout} from 'actions'
import R from 'ramda'

const appStateLoaded = (props)=>{
  return !props.isLoadingAppState &&
         props.currentUser &&
         props.currentOrg
}

const ensureCurrentUser = (props)=>{
  if(props.isLoadingAppState)return
  const orgSlug = props.params.orgSlug.toLowerCase()
  //avoid request loop on failure
  if(props.currentUserErr && orgSlug == props.currentOrgSlug)return

  if(props.currentOrgSlug && props.currentOrgSlug != orgSlug){
    props.selectOrg(orgSlug)
  }

  if(!appStateLoaded(props)){
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

  render(){
    if (appStateLoaded(this.props)){

      return <div>
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
    apps: getApps(state),
    services: getServices(state),
    users: getUserGroupsByRole(state),
    isLoadingAppState: getIsLoadingAppState(state),
    permissions: getPermissions(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchCurrentUser: ()=> dispatch(fetchCurrentUser()),
    selectOrg: (slug)=> dispatch(selectOrg(slug)),
    logout: ()=> {
      dispatch(push("/login"))
      dispatch(logout())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)
