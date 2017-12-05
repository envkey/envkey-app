import React from 'react'
import { connect } from 'react-redux'
import {Link} from 'react-router'
import R from 'ramda'
import {
  getCurrentOrg,
  getCurrentUser,
  getIsUpdatingSubscription,
  getActiveUsers,
  getPendingUsers,
  getApps
} from "selectors"
import {
  billingUpgradeSubscription
} from "actions"
import Spinner from 'components/shared/spinner'
import {OnboardOverlay} from 'components/onboard'
import {openLinkExternal} from "lib/ui"

const TrialOverdue = ({
  currentOrg,
  currentUser,
  numActiveUsers,
  numPendingUsers,
  numApps,
  isUpdatingSubscription,
  upgradeSubscription
})=> {

  const
    totalUsers = numActiveUsers + numPendingUsers,

    renderUserLimit = ()=> {
      if (totalUsers > currentOrg.freePlan.maxUsers){
        return <div className="limit-row">
          <label>Users</label>
          <span className="limit">The Free Tier limit is <em>{currentOrg.freePlan.maxUsers}.</em> </span>
          <span className="num">You have <em>{totalUsers}. </em> <small>  {numActiveUsers} active, {numPendingUsers} pending</small></span>
        </div>
      }
    },

    renderAppsLimit = ()=> {
      if (numApps > currentOrg.freePlan.maxApps){
        return <div className="limit-row">
          <label>Apps</label>
          <span className="limit">The Free Tier limit is <em>{currentOrg.freePlan.maxApps}. </em></span>
          <span className="num">You have <em>{numApps}.</em></span>
        </div>
      }
    },

    renderLimitDetails = ()=> {
      if (currentUser.role == "org_owner"){
        return <div className="limit-details">
          {renderUserLimit()}
          {renderAppsLimit()}
        </div>
      }
    },

    renderLimits = ()=> {
      return <div className="exceeds-limits">
        <p><strong>{currentOrg.name}</strong> exceeds the Free Tier limits.</p>
        {renderLimitDetails()}
      </div>
    },

    renderInstructions = ()=> {
      let instructions

      if (currentUser.role == "org_owner"){
        instructions = `To regain access, upgrade to the Business Tier or downgrade to the Free Tier. `
      } else {
        instructions = `To regain access, the org owner ${currentOrg.ownerName} should upgrade to the Business Tier or downgrade to the Free Tier. `
      }

      return <p className="instructions">{instructions}</p>
    },

    renderActions = ()=>{
      if (currentUser.role == "org_owner"){
        if (isUpdatingSubscription){
          return <Spinner />
        } else {
          return <div className="actions">
            <Link to={`/${currentOrg.slug}/downgrade_removal`} className="button secondary"><span>Downgrade To Free Tier</span></Link>
            <button className="primary" onClick={upgradeSubscription}>Upgrade To Business Tier</button>
          </div>
        }
      }
    },

    renderPriceLink = ()=>{
      if (currentUser.role == "org_owner"){
        return <div className="price-link">
          <a href="https://www.envkey.com/pricing" target="__blank" onClick={openLinkExternal}>Pricing Details</a>
        </div>
      }
    },

    renderBackLink = ()=>{
      return <Link className="back-link" to="/home">
        <span className="img">←</span>
        <span>Back To Home </span>
      </Link>
    }

  return <OnboardOverlay>
    <div className="trial-overdue">
      <h1> <em>Free Trial</em> Ended </h1>
      <div className="onboard-auth-form">
        {renderLimits()}
        {renderInstructions()}
        {renderActions()}
        {renderPriceLink()}
        {renderBackLink()}
      </div>
    </div>
  </OnboardOverlay>
}

const mapStateToProps = state => {
  return {
    currentUser: getCurrentUser(state),
    currentOrg: getCurrentOrg(state),
    isUpdatingSubscription: getIsUpdatingSubscription(state),
    numApps: getApps(state).length,
    numActiveUsers: getActiveUsers(state).length,
    numPendingUsers: getPendingUsers(state).length
  }
}

const mapDispatchToProps = dispatch => {
  return {
    upgradeSubscription: ()=> dispatch(billingUpgradeSubscription())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TrialOverdue)