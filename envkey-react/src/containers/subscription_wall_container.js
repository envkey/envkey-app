import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import { billingUpgradeSubscription } from 'actions'
import { getCurrentOrg, getOrgOwner, getIsUpdatingSubscription } from 'selectors'
import Spinner from 'components/shared/spinner'


const SubscriptionWall = function({
  org,
  type,
  max,
  orgOwner,
  isUpdatingSubscription,
  onUpgradeSubscription,
  createVerb="create",
  deleteVerb="delete"
}){
  const
    trialDaysRemaining = ()=> {
      if (org.subscription.trialEndsAt){
        const now = moment.utc(),
              endsAt = moment.utc(org.subscription.trialEndsAt * 1000)

        if(now.isAfter(endsAt)){
          return 0
        }

        return now.diff(endsAt) / (1000 * 60 * 60 * 24)

      } else {
        return 0
      }
    },

    renderFreeTrialInfo = ()=> {
      const days = trialDaysRemaining(org)

      if (days > 0){
        const dayStr = days < 1 ? "less than a day" : `${Math.round(days)} days`

        return <div className="trial-info">
          <p> New organization accounts get 30 days to try the Business Tier before being billed. You have {dayStr} of free trial remaining.</p>
        </div>
      }
    },

    renderNeedsSubscriptionUpgradeForOwner = ()=>{
      return <div className="subscription-wall">
        <p>{org.name} has <strong>{max} {type}s</strong>, which is the maximum for the <em>Free Tier.</em></p>

        <p>To {createVerb} another, either {deleteVerb} an existing {type} or upgrade to the <em>Business Tier.</em></p>

        {renderFreeTrialInfo(org)}

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
        <p>{org.name} has <strong>{max} {type}s</strong>, which is the maximum for the <em>Free Tier.</em></p>
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