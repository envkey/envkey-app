import React from "react"
import ReactDOM from "react-dom"
import h from "lib/ui/hyperscript_with_helpers"
import {StripeProvider, Elements, injectStripe, CardElement} from 'react-stripe-elements'
import isElectron from 'is-electron'

class StripeCardForm extends React.Component {

  _onSubmit(e){
    e.preventDefault()
    this.props.stripe.createToken().then(({token}) => {
      if (token){
        if (isElectron()){
          window.ipc.send("stripeToken", JSON.stringify(token.id))
        } else {
          window.localStorage.setItem("stripeToken", JSON.stringify(token.id))
          window.localStorage.removeItem("stripeToken")
        }

        window.close()
      }
    })
  }

  render(){
    return h.form({onSubmit: ::this._onSubmit}, [
      h.label([
        h.span("Card Details"),
        h(CardElement)
      ]),
      h.button("Submit Card")
    ])
  }
}

const Root = h(StripeProvider, {apiKey: process.env.STRIPE_PUBLISHABLE_KEY}, [
  h(Elements, [
    h(injectStripe(StripeCardForm))
  ])
])

ReactDOM.render(Root, document.getElementById('root'))