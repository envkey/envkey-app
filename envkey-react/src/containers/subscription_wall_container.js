import React from 'react'
import { connect } from 'react-redux'
import { billingUpgradeSubscription } from 'actions'
import { getCurrentOrg, getOrgOwner, getIsUpdatingSubscription } from 'selectors'
import Spinner from 'components/shared/spinner'
import { trialDaysRemaining } from "lib/billing"

const SubscriptionWall = function({
  org,
  subject,
  type,
  max,
  orgOwner,
  isUpdatingSubscription,
  onUpgradeSubscription,
  createVerb="create",
  deleteVerb="delete"
}){
  const
    // renderFreeTrialInfo = ()=> {
    //   const days = trialDaysRemaining(org.subscription.trialEndsAt)

    //   if (days > 0){
    //     const dayStr = days < 1 ? "less than a day" : `${Math.floor(days) + 1} days`

    //     return <div className="trial-info">
    //       <p> New organizations get <strong>30 days</strong> to try the Business Tier before being billed. Your free trial has <strong>{dayStr}</strong> remaining.</p>
    //     </div>
    //   }
    // },

    renderNeedsSubscriptionUpgradeForOwner = ()=>{
      return <div className="subscription-wall">
        <p>{subject || org.name} has <strong>{max} {type}{max == 1 ? '': 's'}</strong>, which is the maximum for the <em>Free Tier.</em></p>

        <p>To {createVerb} another, either {deleteVerb} an existing {type} or upgrade to the <em>Business Tier</em> for $4/user/month.</p>

        <button className="button"
                onClick={onUpgradeSubscription}>
          Upgrade To Business Tier
        </button>
      </div>
    },

    renderNeedsSubscriptionUpgradeForNonOwner = ()=>{
      const ownerName = [orgOwner.firstName, orgOwner.lastName].join(" "),
            ownerStr = `${ownerName} <${orgOwner.email}>`

      return <div className="subscription-wall">
        <p>{subject || org.name} has <strong>{max} {type}{max == 1 ? '': 's'}</strong>, which is the maximum for the <em>Free Tier.</em></p>
        <p>To {createVerb} another, either {deleteVerb} an existing {type} or ask {ownerStr} to upgrade to the <em>Business Tier.</em></p>
      </div>
    },

    renderUpdatingSubscription = ()=>{
      return <div className="subscription-wall is-updating">
        <p>Updating subscription...</p>
        <Spinner />
      </div>
    }

  if (isUpdatingSubscription){
    return renderUpdatingSubscription()
  } else if (org.role == "org_owner"){
    return renderNeedsSubscriptionUpgradeForOwner()
  } else {
    return renderNeedsSubscriptionUpgradeForNonOwner()
  }
}

const mapStateToProps = state => {
  return {
    org: getCurrentOrg(state),
    orgOwner: getOrgOwner(state),
    isUpdatingSubscription: getIsUpdatingSubscription(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onUpgradeSubscription: ()=> dispatch(billingUpgradeSubscription())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionWall)