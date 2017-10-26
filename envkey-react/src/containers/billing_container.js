import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import moment from "moment"
import {
  getCurrentOrg,
  getApps,
  getActiveUsers,
  getIsUpdatingSubscription,
  getIsUpdatingStripeCard,
  getMostEnvKeysPerEnvironment
} from "selectors"
import {
  billingUpgradeSubscription,
  billingCancelSubscription,
  billingUpdateCard
} from "actions"
import {imagePath} from 'lib/ui'
import BillingColumns from 'components/billing/billing_columns'
import Spinner from 'components/shared/spinner'
import {trialDaysRemaining} from "lib/billing"

class Billing extends React.Component {

  constructor(props){
    super(props)
    this.state = { confirmCancel: false }
  }

  _isFreeTier(){
    return this.props.subscription.planId == this.props.freePlan.id
  }

  _isBusinessTier(){
    return this.props.subscription.planId == this.props.businessPlan.id
  }

  _subscriptionStatus(){
    if (["past_due",
    "unpaid"].includes(this.props.subscription.status)){
      return "overdue"
    } else if (this.props.subscription.status == "trialing"){
      `trial - ${0} days left`
    } else {
      return this.props.subscription.status
    }
  }

  _isUpdating(){
    return this.props.isUpdatingSubscription || this.props.isUpdatingStripeCard
  }

  _onConfirmCancel(){
    this.props.cancelSubscription()
    this.setState({confirmCancel: false})
  }

  render(){
    return h.div(".billing", {className: (this._isUpdating() ? "updating" : "")}, this._renderContents())
  }

  _renderContents(){
    if (this._isUpdating()){
      return [
        h.div(".viewport-overlay", {
          className: (this._isUpdating() ? "" : "hide")
        }, [
          h.div(".overlay-loader.decrypt-loader", [
            h.span(".label", "Updating..."),
            h(Spinner)
          ])
        ])
      ]
    } else {
      return this._isFreeTier() ? this._renderFreeTierContents() :
                                  this._renderPaidTierContents()
    }
  }

  _renderPaidTierContents(){
    return [
      this._renderSubscription(),
      this._renderStripeCard()
    ]
  }

  _renderFreeTierContents(){
    return [
      this._renderSubscription(),
      this._renderUpgrade()
    ]
  }

  _renderAlert(){
    if (this.props.subscription.status == "past_due"){
      return h.div(".alert", [
        h.h2("Billing Alert"),
        h.p("Your most recent invoice is past due. Please update your payment details so we can continue to provide service to your organization."),
        h.p([
          "If you have any questions or concerns, please contact ",
          h.strong("support@envkey.com")
        ])
      ])
    }
  }

  _renderSubscription(){
    let contents

    if (this._isFreeTier()){
      contents = [
        h.h3("Free Tier"),
        h(BillingColumns, {columns: [
          [
            [,
              [
                "Unlimited users",
                "Unlimited apps",
                "Unilimited sub-environments",
                "Unlimited EnvKeys per environment"
              ]
            ],
          ],
        ]}),

      ]
    } else if (this._isBusinessTier()){
      contents = [
        h.h3("Business Tier"),
        h(BillingColumns, {columns: [
          [
            [`$${parseInt(this.props.subscription.amount / 100)}.00 USD / user / month`,
              [
                "Unlimited users",
                "Unlimited apps",
                "Unilimited sub-environments",
                "Unlimited EnvKeys per environment"
              ]
            ],
          ],
          [
            ["Subscription status",
              [this._subscriptionStatus()]
            ],
            ["Next invoice due",
              [moment(this.props.subscription.currentPeriodEndsAt || this.props.subscription.trialEndsAt).calendar()]
            ],
          ],

          [
            ["Active users", [this.props.numUsers]],

            ["Next invoice total charge", [`$${parseInt(this.props.subscription.amount * this.props.numUsers / 100)}.00`]],
          ],
        ]}),

        this._renderCancel()
      ]
    }

    return h.section(".plan", [
      h.h2("Your Plan"),
      h.div(".content", contents)
    ])
  }

  _renderStripeCard(){


    let cardDetails, cardActions

    if (this.props.stripeCard){

      const {brand, last4, expMonth, expYear} = this.props.stripeCard
      cardDetails = h.div(".card-details", [
        h.div(".row", [
          h.label(brand),
          h.span(["XXXX XXXX XXXX ", h.strong(last4)])
        ]),

        h.div(".row", [
          h.label("Expires"),
          h.span([h.strong(`${expMonth}/${expYear}`)])
        ])
      ])

      cardActions = h.div(".actions", [
        h.button(".button", {onClick: this.props.updateCard}, "Update Card")
      ])

      return h.section(".stripe-card", [
        h.h2("Payment Method"),
        cardDetails,
        cardActions
      ])
    }
  }

  _renderUpgrade(){
    const contents = [
      h.h3("Business Tier"),
      h(BillingColumns, {columns: [
        [
          [`$${parseInt(this.props.businessPlan.amount / 100)}.00 / user / month`,
            [
              "Unlimited users",
              "Unlimited apps",
              "Unlimited sub-environments",
              "Unlimited EnvKeys per environment"
            ]
          ],
        ]
      ]}),
      this._renderUpgradeTrialRemaining(),
      h.div(".actions", [
        h.button(".button", {onClick: this.props.upgradeSubscription}, "Upgrade To Business Tier")
      ])
    ]

    return h.section(".upgrade", [
      h.h2("Upgrade"),
      h.div(".content", contents)
    ])
  }

  _renderUpgradeTrialRemaining(){
    const days = trialDaysRemaining(this.props.subscription.trialEndsAt)
    if (days > 0){
      const txt = `You have ${days} day${days == 1 ? "" : "s"} of free trial remaining for the Business Tier.`

      return h.div(".trial-remaining", txt)
    }
  }

  _renderCancel(){
    if (this.state.confirmCancel){
      return this._renderConfirmCancel()
    } else {
      return h.div(".actions", [
        h.button(".button", {onClick: ()=> this.setState({confirmCancel: true})}, "Cancel Subscription")
      ])
    }
  }

  _renderConfirmCancel(){
    return h.div(".confirm-cancel", [
      h.h5("Are you sure you want to cancel your subscription?"),
      this._renderCancelWarning(),
      h.div(".actions", [
        h.button(".button.cancel", {onClick: ()=> this.setState({confirmCancel: false})}, "No, don't cancel"),
        h.button(".button.confirm", {onClick: ::this._onConfirmCancel}, "Yes, cancel subscription")
      ])
    ])
  }

  _renderCancelWarning(){
    const {maxUsers, maxApps, maxKeysPerEnv} = this.props.freePlan

    if (this.props.numUsers > maxUsers ||
        this.props.numApps > maxApps ||
        this.props.mostEnvKeys > maxKeysPerEnv ){
      return h.div(".cancel-warning", [
        h.strong("Warning"),
        h.p(`Since your organization has more than the Free Tier maximum of ${maxUsers} users, ${maxApps} apps, and/or ${maxKeysPerEnv} EnvKeys per environment, canceling your subscription will cause all but the first ${maxUsers} users (by join date), first ${maxApps} apps (by creation date), and first ${maxKeysPerEnv} EnvKeys per environment (by creation date) to be removed from your organization. This cannot be undone.`),
        h.p("If you want to have more control, you can delete apps or remove users until you are below the limits, then cancel.")
      ])
    }

  }

  _renderInvoices(){

  }
}

const mapStateToProps = state => {
  const currentOrg = getCurrentOrg(state)

  return {
    ...R.pick(
      ["subscription", "freePlan", "businessPlan", "stripeCard", "invoices"],
      currentOrg
    ),
    numApps: getApps(state).length,
    numUsers: getActiveUsers(state).length,
    mostEnvKeys: getMostEnvKeysPerEnvironment(state),
    isUpdatingSubscription: getIsUpdatingSubscription(state),
    isUpdatingStripeCard: getIsUpdatingStripeCard(state),

  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateCard: ()=> dispatch(billingUpdateCard()),
    upgradeSubscription: ()=> dispatch(billingUpgradeSubscription()),
    cancelSubscription: ()=> dispatch(billingCancelSubscription())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Billing)

