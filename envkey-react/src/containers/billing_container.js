import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import {getCurrentOrg, getApps, getUsers} from "selectors"
import {
  billingUpgradeSubscription,
  billingCancelSubscription,
  billingUpdateCard
} from "actions"
import {imagePath} from 'lib/ui'

class Billing extends React.Component {

  render(){
    return h.div(".billing", [
      this._renderAlert(),
      this._renderSubscription(),
      this._renderStripeCard(),
      this._renderInvoices()
    ])
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

  _renderStripeCard(){
    let cardDetails, cardActions

    if (this.props.stripeCard){

      const {brand, last4, expMonth, expYear} = this.props.stripeCard
      cardDetails = h.div(".card-details", [
        h.span(".brand", brand),
        h.span(".num", `**** **** **** ${last4}`),
        h.span(".exp", `${expMonth}/${expYear}`)
      ])

      cardActions = h.div(".card-actions", [
        h.button(".button", {onClick: this.props.updateCard}, "Update Card")
      ])

      return h.div(".stripe-card", [
        h.h2("Saved Card"),
        cardDetails,
        cardActions
      ])
    }
  }

  _renderSubscription(){
    let contents

    if (this.props.subscription.planId == this.props.freePlan.id){
      contents = [
        h.h2("Free Tier"),
        h.button(".button", {onClick: this.props.upgradeSubscription}, "Upgrade To Business Tier")
      ]
    } else if (this.props.subscription.planId == this.props.businessPlan.id){
      contents = [
        h.h2("Business Tier"),
        h.button(".button", {onClick: this.props.cancelSubscription}, "Cancel Subscription")
      ]
    }

    return h.div(".subscription", contents)
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
    numUsers: getUsers(state).length
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

