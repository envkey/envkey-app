import React from 'react'
import { connect } from 'react-redux'
import {createObject} from 'actions'
import {getIsCreating} from 'selectors'
import {getCurrentUser} from 'selectors'
import OnboardOverlay from 'components/onboard/onboard_overlay'

const
  mapStateToProps = (state, ownProps) => ({
    currentUser: getCurrentUser(state)
  }),

  mapDispatchToProps = (dispatch, ownProps) => ({
    createApp: params => dispatch(createObject({objectType: "app", params}))
  })

export default connect(mapStateToProps, mapDispatchToProps)(OnboardOverlay)

