import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import Spinner from 'components/shared/spinner'
import {OnboardOverlay} from 'components/onboard'
import {selectAccount} from 'actions'
import {getAccounts, getIsAuthenticating} from 'selectors'
import R from 'ramda'

const SelectAccount = ({accounts, isAuthenticating, onSelect})=>{

  const renderSelectButton = (auth)=>{
    return <button onClick={e => onSelect({auth, privkey: accountPrivkeys[auth.id]})}> Select </button>
  }

  const renderAccount = (account, i)=> {
    return <div key={i || false} className={i % 2 == 0 ? "even" : "odd"}>
      <label>{account.uid}</label>
      {renderSelectButton(account)}
    </div>
  }

  const renderAccountSelect = ()=> {
    if(isAuthenticating){
      return <Spinner />
    } else {
      return <div className="account-candidates">{accounts.map(renderAccount)}</div>
    }
  }

  return <OnboardOverlay>
    <div className="onboard-auth-form select-account">
      <h1><em>Select An Account</em></h1>
      {renderAccountSelect()}
    </div>
  </OnboardOverlay>

}

const mapStateToProps = state => {
  return {
    isAuthenticating: getIsAuthenticating(state),
    accounts: getAccounts(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSelect: (params) => {
      if(!document.body.className.includes("preloader-authenticate")){
        document.body.className += " preloader-authenticate"
      }
      document.getElementById("preloader-overlay").className = "full-overlay"
      dispatch(selectAccount(params))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectAccount)