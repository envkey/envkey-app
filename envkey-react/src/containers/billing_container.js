import React from 'react'
import { connect } from 'react-redux'
import {Link} from 'react-router'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import moment from "moment"
import {
  getCurrentOrg,
  getCurrentUser,
  getApps,
  getActiveUsers,
  getPendingUsers,
  getIsUpdatingSubscription,
  getIsUpdatingStripeCard,
  getIsExceedingFreeTier,
  getStripeFormOpened,
  getInvoices,
  getIsUpdatingSettings
} from "selectors"
import {
  billingUpgradeSubscription,
  billingCancelSubscription,
  billingUpdateCard,
  updateObjectSettings
} from "actions"
import {imagePath} from 'lib/ui'
import BillingColumns from 'components/billing/billing_columns'
import InvoiceSettingsForm from 'components/forms/org/invoice_settings_form'
import Spinner from 'components/shared/spinner'
import {InvoiceListContainer} from 'containers'
import {trialDaysRemaining} from "lib/billing"
import {shortNum} from "lib/utils/string"

class Billing extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      confirmCancel: false,
      willShowUpgradeForm: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stripeFormOpened && this.state.willShowUpgradeForm){
      this.setState({willShowUpgradeForm: false})
    }
  }

  _onUpgrade(){
    this.setState({willShowUpgradeForm: true})
    this.props.upgradeSubscription()
  }

  _isFreeTier(){
    return this.props.subscription.planId == this.props.freePlan.id
  }

  _isPreTrial(){
    return this.props.subscription.planId == this.props.preTrialPlan.id
  }

  _isTrial(){
    return this.props.subscription.planId == this.props.trialPlan.id
  }

  _isBusinessTier(){
    return this.props.subscription.planId == this.props.businessPlan.id
  }

  _isCustomPlan(){
    return this.props.subscription.planId == this.props.customPlan.id
  }

  _isTrialing(){
    return this._isTrial() || this._isPreTrial()
  }

  _subscriptionStatus(){
    if (["past_due","unpaid"].includes(this.props.subscription.status)){
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
      if (this._isCustomPlan()){
        return this._renderCustomPlanContents()
      } else if (this._isTrialing()){
        return this._renderTrialContents()
      } else if (this._isFreeTier()){
        return this._renderFreeTierContents()
      } else if (this._isBusinessTier()) {
        return this._renderPaidTierContents()
      }
    }
  }

  _renderPaidTierContents(){
    return [
      this._renderSubscription(),
      this._renderStripeCard(),
      this._renderInvoiceSettings(),
      this._renderInvoices()
    ]
  }

  _renderFreeTierContents(){
    return [
      this._renderSubscription(),
      this._renderUpgrade()
    ]
  }

  _renderTrialContents(){
    return [
      this._renderSubscription(),
      this._renderUpgrade()
    ]
  }

  _renderCustomPlanContents(){
    return [this._renderSubscription()]
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

    if (this._isCustomPlan()){
      contents = [
        h.h3("Custom Plan"),
        <p>Your organization is subscribed to a customized plan. Please email <strong>support@envkey.com</strong> to discuss any billing issues.</p>
      ]
    } else if (this._isTrial()){
      contents = [
        h.h3("Free Trial"),
        h.p(`${this.props.trialDaysRemaining} days remaining`)
      ]
    } else if (this._isPreTrial()){
      contents = [
        h.h3("Free Trial - Awaiting Integration"),
        h.p(`Your ${this.props.currentOrg.trialNumDays} day free trial will begin after you integrate your first ENVKEY`)
      ]
    } else if (this._isFreeTier()){
      contents = [
        h.h3("Free Tier"),
        h(BillingColumns, {columns: [
          [
            ["Free",
              [
                `Up to ${this.props.freePlan.maxUsers} users`,
                `Up to ${this.props.freePlan.maxApps} apps`,
                `Up to ${this.props.freePlan.maxKeysPerEnv - 1} sub-environment per environment`,
                `Up to ${this.props.freePlan.maxKeysPerEnv} ENVKEYs per environment`
              ]
            ],
          ],
        ]}),

      ]
    } else if (this._isBusinessTier()){
      contents = this.props.currentOrg.pricingVersion >= 4 ?
        this._renderBusinessTierPostV4() :
        this._renderBusinessTierPreV4()
    }

    return h.section(".plan", [
      h.h2("Your Plan"),
      h.div(".content", contents)
    ])
  }

  _renderBusinessTierPreV4(){
    return [
      h.h3(this.props.businessPlan.name),
      h(BillingColumns, {columns: [
        [
          [`$${parseInt(this.props.subscription.amount / 100)}.00 USD / user / month`,
            [
              "Unlimited apps",
              "Unilimited environments",
              "Unlimited ENVKEYs"
            ]
          ],
        ],
        [
          ["Subscription status",
            [this._subscriptionStatus()]
          ],
          ["Next invoice due",
            [
              moment(this.props.subscription.currentPeriodEndsAt).calendar(null, {
                sameElse: "YYYY-MM-DD"
              })
            ]
          ],
        ],

        [
          ["Active users", [<span>{this.props.numActiveUsers} {this._renderPendingUsers()}</span>]],

          ["Next invoice total charge", [<span>${parseInt(this.props.subscription.amount * this.props.numActiveUsers / 100)}.00 {this._renderPendingCharge()}</span>]],
        ],
      ]}),

      this._renderCancel()
    ]
  }

  _renderBusinessTierPostV4(){
    return [
      h.h3(this.props.businessPlan.name),
      h(BillingColumns, {columns: [
        [
          [`$${parseInt(this.props.subscription.amount / 100)}.00 USD per month`,
            this._renderBusinessPlanLimitsPostV4()
          ],
        ],
        [
          ["Subscription status",
            [this._subscriptionStatus()]
          ],
          ["Next invoice due",
            [
              moment(this.props.subscription.currentPeriodEndsAt).calendar(null, {
                sameElse: "YYYY-MM-DD"
              })
            ]
          ],
        ]
      ]}),

      this._renderCancel()
    ]
  }

  _renderPendingUsers(){
    const numPending = this.props.numPendingUsers
    if (numPending > 0){
      return <small>+ {numPending} pending invitation{numPending == 1 ? '' : 's'} </small>
    }
  }

  _renderPendingCharge(){
    if (this.props.numPendingUsers > 0){
      return <small>+ ${parseInt(this.props.subscription.amount * this.props.numPendingUsers / 100)}.00 pending</small>
    }
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
    const contents = this.props.currentOrg.pricingVersion >= 4 ?
      this._renderUpgradePostV4() :
      this._renderUpgradePreV4()

    return h.section(".upgrade", [
      h.h2("Upgrade"),
      h.div(".content", contents)
    ])
  }

  _renderUpgradePreV4(){
    return [
      h.h3(),
      h(BillingColumns, {columns: [
        [
          [`$${parseInt(this.props.businessPlan.amount / 100)}.00 / user / month`,
            [
              "Unlimited apps",
              "Unlimited environments",
              "Unlimited ENVKEYs"
            ]
          ],
        ]
      ]}),
      h.div(".actions", [
        this._renderUpgradeButton()
      ])
    ]
  }

  _renderUpgradePostV4(){
    return [
      h.h3(),
      h(BillingColumns, {columns: [
        [
          [`$${parseInt(this.props.businessPlan.amount / 100)}.00 per month`,
            this._renderBusinessPlanLimitsPostV4()
          ],
        ]
      ]}),
      h.div(".actions", [
        this._renderUpgradeButton()
      ])
    ]
  }

  _renderUpgradeButton(){
    if (this.state.willShowUpgradeForm){
      return h(Spinner)
    } else {
      return h.button(".button", {onClick: ::this._onUpgrade}, `Upgrade To ${this.props.businessPlan.name}`)
    }
  }

  _renderCancel(){
    if (this.state.confirmCancel){
      return this._renderConfirmCancel()
    } else if (this.props.currentOrg.pricingVersion == 1 && this.props.isExceedingFreeTier) {
      return <div className="actions">
        <Link to={`/${this.props.currentOrg.slug}/downgrade_removal`} className="button"><span>Cancel Subscription</span></Link>
      </div>
    } else {
      return h.div(".actions", [
        h.button(".button", {onClick: ()=> this.setState({confirmCancel: true})}, "Cancel Subscription")
      ])
    }
  }

  _renderConfirmCancel(){
    return h.div(".confirm-cancel", [
      h.h5(`Are you sure you want to cancel your subscription?`),
      h.div(".actions", [
        h.button(".button.cancel", {onClick: ()=> this.setState({confirmCancel: false})}, "No, don't cancel"),
        h.button(".button.confirm", {onClick: ::this._onConfirmCancel}, "Yes, cancel subscription")
      ])
    ])
  }

  _renderBusinessPlanLimitsPostV4(){
    return [
      `Up to ${this.props.businessPlan.endsAtNumUsers} users`,
      "Unlimited apps",
      "Unlimited ENVKEYs"
      // `Up to ${this.props.businessPlan.endsAtNumConnectedServers} connected servers`,
      // `Up to ${shortNum(this.props.businessPlan.endsAtNumConfigRequests)} config requests`
    ]
  }

  _renderInvoiceSettings(){
    return <section className="billing-invoice-settings">
      <h2> Invoice Settings </h2>
      <InvoiceSettingsForm {...this.props} />
    </section>
  }

  _renderInvoices(){
    return <section className="billing-invoices">
      <h2> Invoices </h2>
      <InvoiceListContainer />
    </section>
  }
}

const mapStateToProps = state => {
  const currentOrg = getCurrentOrg(state)

  return {
    ...R.pick(
      [
        "subscription",
        "preTrialPlan",
        "trialPlan",
        "freePlan",
        "businessPlan",
        "customPlan",
        "trialing",
        "trialOverdue",
        "trialDaysRemaining",
        "stripeCard",
        "name",
        "billingName",
        "billingEmail",
        "billingAddress",
        "billingVat",
        "id"
      ],
      currentOrg
    ),
    numApps: getApps(state).length,
    numActiveUsers: getActiveUsers(state).length,
    numPendingUsers: getPendingUsers(state).length,
    isExceedingFreeTier: getIsExceedingFreeTier(state),
    isUpdatingSubscription: getIsUpdatingSubscription(state),
    isUpdatingStripeCard: getIsUpdatingStripeCard(state),
    stripeFormOpened: getStripeFormOpened(state),
    invoices: getInvoices(state),
    ownerEmail: getCurrentUser(state).email,
    isUpdatingSettings: getIsUpdatingSettings(currentOrg.id, state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateCard: ()=> dispatch(billingUpdateCard()),
    upgradeSubscription: ()=> dispatch(billingUpgradeSubscription()),
    cancelSubscription: ()=> dispatch(billingCancelSubscription()),
    updateInvoiceSettings: (targetId, params) => dispatch(updateObjectSettings({
      objectType: "org",
      targetId,
      params
    }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Billing)

