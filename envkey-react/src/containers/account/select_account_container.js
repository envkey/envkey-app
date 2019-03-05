import React from 'react'
import h from 'lib/ui/hyperscript_with_helpers'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import {OnboardOverlay} from 'components/onboard'
import {selectAccount, logout, resetSession} from 'actions'
import {getAccounts} from 'selectors'
import {imagePath, setAuthenticatingOverlay} from 'lib/ui'

const SelectAccount = ({
  accounts,
  onSelect,
  onRemove,
  onResetSession
})=>{

  const
    renderSelectButton = (auth)=>{
      return <button onClick={e => onSelect({auth})}> Sign In </button>
    },

    renderAccount = (account, i)=> {
      return <div key={i || false} className={i % 2 == 0 ? "even" : "odd"}>
        <img className="remove" src={imagePath("remove-circle-black.png")} onClick={()=> onRemove(account.id)}/>
        <label>{(account.provider == "email" ? "" : account.provider + " - ") + account.email}</label>
        {renderSelectButton(account)}
      </div>
    },

    renderAccountSelect = ()=> {
      return <div className="select-candidates account-candidates">{accounts.map(renderAccount)}</div>
    },

    renderAddAccount = ()=> {
      return <Link to="/auth_methods/sign_up" className="button secondary-button add-account" onClick={()=> onResetSession()}>
          <img src={imagePath("plus-sign-blue.svg")} />
          <label>Add An Account</label>
        </Link>
    },

    renderBackLink = ()=> {
      return h(Link, {className: "back-link", to: "/home"}, [
        h.span(".img", "←"),
        h.span("Back To Home")
      ])
    }

  return <OnboardOverlay>
    <div className="onboard-auth-form select-account">
      <h1>Select An <em>Account</em></h1>
      {renderAccountSelect()}
      {renderAddAccount()}
      {renderBackLink()}
    </div>
  </OnboardOverlay>
}

const mapStateToProps = state => {
  return {
    accounts: getAccounts(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onRemove: accountId => dispatch(logout({accountId})),
    onResetSession: ()=> dispatch(resetSession()),
    onSelect: (params) => {
      setAuthenticatingOverlay()
      dispatch(selectAccount(params))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectAccount)