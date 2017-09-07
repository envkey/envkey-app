import {store} from 'init_redux'
import {billingStripeFormSubmitted, billingStripeFormClosed} from 'actions'
import isElectron from 'is-electron'

export const

  listenCardForm = ()=>{
    if(isElectron()){
      window.ipc.on("stripeToken", (e, msg)=>{
        store.dispatch(billingStripeFormSubmitted({stripeToken: JSON.parse(msg)}))
      })

      window.ipc.on("stripeFormClosed", ()=>{
        store.dispatch(billingStripeFormClosed())
      })
    } else {
      const tokenReceive = (e)=> {
        if (e.key == 'stripeToken' && e.newValue) {
          store.dispatch(billingStripeFormSubmitted({stripeToken: JSON.parse(e.newValue)}))
        } else if (e.key == 'stripeFormClosed'){
          store.dispatch(billingStripeFormClosed())
        }
      }
      window.addEventListener("storage", tokenReceive)
    }
  },

  openCardForm = (type, data={})=>{
    const json = encodeURIComponent(JSON.stringify({type, ...data}))
    if (isElectron()){
      window.ipc.send("openStripeForm", json)
    } else {
      window.open(`/stripe_card.html?data=${json}`, "_blank")
    }
  }