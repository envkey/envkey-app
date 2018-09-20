import React from 'react'
import { connect } from 'react-redux'
import { getAppLoaded } from 'selectors'
import { appLoaded } from 'actions'
import {clearAuthenticatingOverlay} from 'lib/ui'

export default function(ContainerClass){
  class BaseRoute extends React.Component {
    componentDidMount(){
      if(!this.props.appLoaded)this.props.onLoad()
      clearAuthenticatingOverlay()
    }

    render(){
      return <ContainerClass {...this.props} />
    }
  }

  const
    mapStateToProps = (state, ownProps) => ({
      ...ownProps, appLoaded: getAppLoaded(state)
    }),

    mapDispatchToProps = dispatch => ({
      onLoad: ()=> dispatch(appLoaded())
    })

  return connect(mapStateToProps, mapDispatchToProps)(BaseRoute)
}

