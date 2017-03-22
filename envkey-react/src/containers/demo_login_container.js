import React from 'react'
import { connect } from 'react-redux'
import { login } from 'actions'
import { push } from 'react-router-redux'
import R from 'ramda'
import {Base64} from 'js-base64'

class DemoLoginContainer extends React.Component {

  componentDidMount(){
    try {
      const credentials = JSON.parse(Base64.decode(this.props.params.credentialsbs64))

      if (credentials && credentials.email && credentials.password){
        console.log(credentials)
        this.props.login(R.pick(["email", "password"],credentials))
      } else {
        this._invalid()
      }
    } catch(e) {
      console.log("Demo credentials parse error: ", e)
      this._invalid()
    }
  }

  _invalid(){
    alert("Sorry, that's an invalid demo url.")
    this.props.invalid()
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
    login: (params) => dispatch(login(params)),
    invalid: ()=> dispatch(push("/login"))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DemoLoginContainer)

