import { connect } from 'react-redux'
import Login from 'components/shared/login'
import {login} from 'actions'
import R from 'ramda'

const mapStateToProps = state => R.pick(['isAuthenticating'], state)

const mapDispatchToProps = dispatch => {
  return {
    onSubmit: (params) => dispatch(login(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)