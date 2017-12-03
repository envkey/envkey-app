import React from "react"
import ReactDOM from "react-dom"
import h from "lib/ui/hyperscript_with_helpers"
import {StripeProvider, Elements, injectStripe, CardElement} from 'react-stripe-elements'
import BillingColumns from 'components/billing/billing_columns'
import queryString from 'query-string'
import moment from 'moment'
import {imagePath} from "lib/ui"
import {trialDaysRemaining} from "lib/billing"

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
    const {plan, numUsersActive, numUsersPending} = this._formData(),
          cols = [<strong>${parseInt(plan.amount * numUsersActive / 100)}.00</strong>]
    if (numUsersPending){
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
            [
              [`$${parseInt(plan.amount / 100)}.00 / user / month`,
                [
                  "Unlimited users",
                  "Unlimited apps",
                  "Unlimited ENVKEYs"
                ]
              ],
            ]
          ]}),
          BillingColumns({columns: [
            [
              ["Active users", this._userCols()],
            ],
            [
              ["Total monthly charge", this._chargeCols()],
            ]
          ]})
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