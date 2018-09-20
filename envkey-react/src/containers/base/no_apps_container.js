import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import {getCurrentOrg, getApps} from 'selectors'
import { selectedObject } from 'actions'

class NoApps extends React.Component {

  componentDidMount(){
    this.props.onLoad()
  }

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
    onLoad: ()=> dispatch(selectedObject({})),
    onHasApp: (currentOrgSlug)=> dispatch(push(`/${currentOrgSlug}`))
  })

export default connect(mapStateToProps, mapDispatchToProps)(NoApps)