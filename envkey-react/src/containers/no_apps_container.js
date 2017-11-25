import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import {getCurrentOrg, getApps} from 'selectors'

class NoApps extends React.Component {

  componentWillReceiveProps(nextProps){
    if (nextProps.hasApp){
      this.props.onHasApp(nextProps.currentOrg.slug)
    }
  }

  render(){
    return <div className="show-page no-apps">
      <h1>No App Access Granted</h1>

      <p>You're a member of {this.props.currentOrg.name}, but you don't have access to any apps.</p>

      <p>Ask an admin to grant you access.</p>
    </div>
  }
}


const
  mapStateToProps = state => ({
    currentOrg: getCurrentOrg(state),
    hasApp: getApps(state).length > 0
  }),

  mapDispatchToProps = dispatch => ({
    onHasApp: (currentOrgSlug)=> dispatch(push(`/${currentOrgSlug}`))
  })

export default connect(mapStateToProps, mapDispatchToProps)(NoApps)