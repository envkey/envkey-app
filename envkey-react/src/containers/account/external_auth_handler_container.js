import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import {

} from 'actions'
import {

} from 'selectors'
import Spinner from 'components/shared/spinner'
import { OnboardOverlay } from 'components/onboard'


class ExternalAuthHandler extends React.Component {
  render() {
    return <div />
  }
}

const mapStateToProps = (state, ownProps) => {
  return {

  }
}

const mapDispatchToProps = dispatch => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExternalAuthHandler)

