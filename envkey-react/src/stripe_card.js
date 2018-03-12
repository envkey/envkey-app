import React from "react"
import ReactDOM from "react-dom"
import h from "lib/ui/hyperscript_with_helpers"
import {StripeProvider, Elements, injectStripe, CardElement} from 'react-stripe-elements'
import BillingColumns from 'components/billing/billing_columns'
import queryString from 'query-string'
import moment from 'moment'
import {imagePath} from "lib/ui"
import {shortNum} from 'lib/utils/string'

class StripeCardForm extends React.Component {

  _onSubmit(e){
    e.preventDefault()
    this.props.stripe.createToken().then(({token}) => {
      if (token){
        window.localStorage.setItem("stripeToken", JSON.stringify(token.id))
        window.localStorage.removeItem("stripeToken")
        window.close()
      }
    })
  }

  _queryParams(){
    if(!this.queryParams)this.queryParams = queryString.parse(window.location.search)
    return this.queryParams
  }

  _formData(){
    if(!this.formData)this.formData = JSON.parse(this._queryParams().data)
    return this.formData
  }

  _formType(){
    return this._formData().type
  }

  _submitCopy(){
   return {upgrade_subscription: "Upgrade", update_payment: "Update"}[this._formType()]
  }

  render(){
    return h.div(".billing.stripe-card-form", [
      this._renderHeader(),
      this._renderInfo(),
      h.form({onSubmit: ::this._onSubmit}, [
        h.h2("Payment Method"),
        this._renderError(),
        h(CardElement),
        h.button(this._submitCopy())
      ]),
      h.img(".stripe-logo", {src: imagePath("powered-by-stripe.svg")})
    ])
  }

  _renderHeader(){
    return h.header([
      h.div(".logo", [
        h.img({src: imagePath("envkey-logo.svg")})
      ])
    ])
  }

  _userCols(){
    const {numUsersActive, numUsersPending} = this._formData(),
          cols = [<strong>{numUsersActive}</strong>]
    if (numUsersPending){
      cols.push(<small>+ {numUsersPending} pending invitation{numUsersPending == 1 ? "" : "s"}</small>)
    }
    return cols
  }

  _chargeCols(){
    const {plan, numUsersActive, numUsersPending} = this._formData()
    let cols

    if (plan.pricingVersion >= 4){
      cols = [<strong>${parseInt(plan.amount / 100)}.00</strong>]
    } else {
      cols = [<strong>${parseInt(plan.amount * numUsersActive / 100)}.00</strong>]
    }

    if (numUsersPending && plan.pricingVersion < 4){
      cols.push(<small>+ ${parseInt(plan.amount * numUsersPending / 100)}.00 pending</small>)
    }

    return cols
  }

  _renderInfo(){
    if (this._formType() == "upgrade_subscription"){
      const {plan} = this._formData()

      return h.section(".plan-info", [
        h.h2("Upgrade Plan"),
        h.h3(plan.name),
        h.div(".billing-info", [
          BillingColumns({columns: [
            [this._renderPricing(),]
          ]}),
          this._renderUserChargeInfo()
        ])
      ])
    }
  }

  _renderUserChargeInfo(){
    const {plan} = this._formData()
    if (plan.pricingVersion < 4){
      return BillingColumns({columns: [
        [
          ["Active users", this._userCols()],
        ],
        [
          ["Total monthly charge", this._chargeCols()],
        ]
      ]})
    }
  }

  _renderPricing(){
    const {plan} = this._formData()
    return plan.pricingVersion >= 4 ? this._renderPricingPostV4() : this._renderPricingPreV4()
  }

  _renderPricingPreV4(){
    const {plan} = this._formData()
    return [`$${parseInt(plan.amount / 100)}.00 / user / month`,
      [
        "Unlimited apps",
        "Unlimited environments",
        "Unlimited ENVKEYs"
      ]
    ]
  }

  _renderPricingPostV4(){
    const {plan} = this._formData()
    return [`$${parseInt(plan.amount / 100)}.00 per month`,
      [
        `Up to ${plan.endsAtNumUsers} users`,
        `Up to ${plan.endsAtNumConnectedServers} connected servers`,
        `Up to ${shortNum(plan.endsAtNumConfigRequests)} config requests`
      ]
    ]
  }

  _renderError(){
    const {error} = this._formData()

    if (error){
      return h.section(".error", [
        h.div(".top", [
          h.span(".error-message", error)
        ]),
        h.div(".bottom", [
          h.span("Please re-enter your card details.")
        ])
      ])
    }
  }
}

const Root = h(StripeProvider, {apiKey: process.env.STRIPE_PUBLISHABLE_KEY}, [
  h(Elements, [
    h(injectStripe(StripeCardForm))
  ])
])

ReactDOM.render(Root, document.getElementById('root'))