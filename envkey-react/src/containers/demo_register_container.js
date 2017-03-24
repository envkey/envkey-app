import React from 'react'
import { connect } from 'react-redux'
import { register } from 'actions'
import { secureRandomAlphanumeric } from 'lib/crypto'

class DemoRegister extends React.Component {

  componentDidMount(){
    this.props.register({
      firstName: "Tester",
      lastName: "Ofdemo",
      email: `demo-${secureRandomAlphanumeric(6)}@envkeydemo.com`,
      password: secureRandomAlphanumeric(10),
      org: {name: `Demo Org ${secureRandomAlphanumeric(4)}`}
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
    register: (params) => dispatch(register(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DemoRegister)

