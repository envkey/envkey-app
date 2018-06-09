import {
  BILLING_UPGRADE_SUBSCRIPTION,
  BILLING_OPEN_STRIPE_FORM,
  BILLING_STRIPE_FORM_SUBMITTED,
  BILLING_STRIPE_FORM_CLOSED,
  BILLING_UPDATE_SUBSCRIPTION_REQUEST,
  BILLING_UPDATE_SUBSCRIPTION_SUCCESS,
  BILLING_UPDATE_SUBSCRIPTION_FAILED,
  BILLING_UPDATE_CARD_REQUEST,
  BILLING_UPDATE_CARD_SUCCESS,
  BILLING_UPDATE_CARD_FAILED
} from "actions"
import R from 'ramda'
import { orgs as coreOrgsReducer } from "envkey-client-core/reducers/org_reducers"

export const
  orgs = (state = {}, action)=>{
    switch(action.type){
      case BILLING_UPDATE_CARD_SUCCESS:
      case BILLING_UPDATE_SUBSCRIPTION_SUCCESS:
        return R.assoc(action.payload.id, action.payload, state)

      default:
        return coreOrgsReducer(state, action)
    }
  },

  stripeFormOpened = (state=false, action)=>{
    switch(action.type){
      case BILLING_OPEN_STRIPE_FORM:
        return true

      case BILLING_STRIPE_FORM_CLOSED:
      case BILLING_STRIPE_FORM_SUBMITTED:
        return false

      default:
        return state
    }
  },

  isUpdatingSubscription = (state = false, action)=>{
    switch(action.type){
      case BILLING_UPDATE_SUBSCRIPTION_REQUEST:
        return true

      case BILLING_UPDATE_SUBSCRIPTION_FAILED:
        return false

      case BILLING_UPDATE_SUBSCRIPTION_SUCCESS:
        return action.meta.updateType == "cancel" ? state : false

      default:
        return state
    }
  },

  isUpdatingStripeCard = (state = false, action)=>{
    switch(action.type){
      case BILLING_UPDATE_CARD_REQUEST:
        return true

      case BILLING_UPDATE_CARD_SUCCESS:
      case BILLING_UPDATE_CARD_FAILED:
        return false

      default:
        return state
    }
  }