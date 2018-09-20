import React from 'react'
import { connect } from 'react-redux'
import { getDisconnected } from 'selectors'
import DisconnectedOverlay from 'components/shared/disconnected_overlay'

export default function(ContainerClass){

  const mapStateToProps = (state, ownProps) => ({
    ...ownProps,
    disconnected: getDisconnected(state)
  })

  return connect(mapStateToProps)(function(props){
    if (props.disconnected){
      return <DisconnectedOverlay />
    }

    return <ContainerClass {...props} />
  })

}

