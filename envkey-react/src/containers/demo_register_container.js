import React from 'react'
import { connect } from 'react-redux'
import { register, startDemo } from 'actions'
import { secureRandomAlphanumeric } from 'lib/crypto'

class DemoRegister extends React.Component {

  componentDidMount(){
    this.props.startDemo()

    this.props.register({
      firstName: "Tester",
      lastName: "Ofdemo",
      email: `demo-${secureRandomAlphanumeric(6)}@envkeydemo.com`,
      password: "demopassword",
      org: {name: `Demo Org-${secureRandomAlphanumeric(4)}`}
    })
  }

  render(){
    return <div />
  }

}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    startDemo: ()=> dispatch(startDemo()),
    register: (params) => dispatch(register(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DemoRegister)

