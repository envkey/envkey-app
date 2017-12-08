import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import { getAccounts } from 'selectors'
import {resetSession } from 'actions'
import HomeMenu from 'components/shared/home_menu'

class Home extends React.Component {

  render(){
    return h(HomeMenu, this.props)
  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    hasAccount: getAccounts(state).length > 0
  }
}

const mapDispatchToProps = dispatch => {
  return {
    resetSession: ()=> dispatch(resetSession())
  }
}

export default connect(mapStateToProps)(Home)

