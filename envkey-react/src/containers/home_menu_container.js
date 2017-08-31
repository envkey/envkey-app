import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import { getAppLoaded } from 'selectors'
import { appLoaded } from 'actions'
import HomeMenu from 'components/shared/home_menu'

class Home extends React.Component {

  componentDidMount(){
    if(!this.props.appLoaded)this.props.onLoad()
  }

  render(){
    return h(HomeMenu)
  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    appLoaded: getAppLoaded(state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoad: ()=> dispatch(appLoaded())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)

