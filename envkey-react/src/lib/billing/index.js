import {
  BILLING_OPEN_STRIPE_FORM,
  billingStripeFormSubmitted,
  billingOpenStripeForm,
  billingStripeFormClosed
} from 'actions'
import isElectron from 'is-electron'
import moment from 'moment'

export const

  listenCardForm = ()=>{
    const store = require("init_redux").store
    const tokenReceive = (e)=> {
      if (e.key == 'stripeToken' && e.newValue) {
        store.dispatch(billingStripeFormSubmitted({stripeToken: JSON.parse(e.newValue)}))
      } else if (e.key == 'stripeFormClosed'){
        store.dispatch(billingStripeFormClosed())
      }
    }
    window.addEventListener("storage", tokenReceive)
  },

  openCardForm = (type, data={})=>{
    const store = require("init_redux").store
    store.dispatch({type: BILLING_OPEN_STRIPE_FORM})
    const json = encodeURIComponent(JSON.stringify({type, ...data}))
    if (isElectron()){
      window.ipc.send("openStripeForm", json)
    } else {
      window.open(`/stripe_card.html?data=${json}`, "_blank")
    }
  },

  trialDaysRemaining = (trialEndsAt)=> {
    if (trialEndsAt){
      const now = moment(),
            endsAt = moment(trialEndsAt)

      if(now.isAfter(endsAt)){
        return 0
      }

      return endsAt.diff(now, 'days')
    } else {
      return 0
    }
  }