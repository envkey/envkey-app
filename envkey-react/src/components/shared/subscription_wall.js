import React from 'react'

export default function({
  org,
  type,
  max,
  orgOwner,
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
      return <div className="needs-upgrade">
        <p>{org.name} has {max} {type}s, which is the maximum number allowed on the Free Tier.</p>

        <p>To {createVerb} another, either {deleteVerb} an existing {type} or upgrade to the Business Tier.</p>

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

      return <div className="needs-upgrade">
        <p>{org.name} has {max} {type}s, which is the maximum number allowed on the Free Tier.</p>
        <p>To {createVerb} another, either {deleteVerb} an existing {type} or ask {ownerStr} to upgrade to the Business Tier.</p>
      </div>
    }

  if (org.role == "org_owner"){
    return renderNeedsSubscriptionUpgradeForOwner()
  } else {
    return renderNeedsSubscriptionUpgradeForNonOwner()
  }
}