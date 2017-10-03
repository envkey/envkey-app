import React from 'react'
import R from 'ramda'
import { connect } from 'react-redux'
import { startDemo } from 'actions'

class DemoLoginContainer extends React.Component {

  componentDidMount() {
    const loginParams = R.pipe(
      atob,
      escape,
      decodeURIComponent,
      JSON.parse
    )(this.props.params.bs64props)

    this.props.startDemo(loginParams)
  }

  render(){
    return <div />
  }

}

const mapDispatchToProps = dispatch => {
  return {
    startDemo: p => dispatch(startDemo(p))
  }
}

export default connect(R.always({}), mapDispatchToProps)(DemoLoginContainer)