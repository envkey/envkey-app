import { ActionType } from 'actions'
import R from 'ramda'
import { orgs as coreOrgsReducer } from "envkey-client-core/dist/reducers/org_reducers"
import {indexById} from 'envkey-client-core/dist/lib/fn'

export const
  orgs = (state = {}, action)=>{
    switch(action.type){
      case ActionType.BILLING_UPDATE_CARD_SUCCESS:
      case ActionType.BILLING_UPDATE_SUBSCRIPTION_SUCCESS:
        return R.assoc(action.payload.id, action.payload, state)

      default:
        return coreOrgsReducer(state, action)
    }
  },

  stripeFormOpened = (state=false, action)=>{
    switch(action.type){
      case ActionType.BILLING_OPEN_STRIPE_FORM:
        return true

      case ActionType.BILLING_STRIPE_FORM_CLOSED:
      case ActionType.BILLING_STRIPE_FORM_SUBMITTED:
        return false

      default:
        return state
    }
  },

  isUpdatingSubscription = (state = false, action)=>{
    switch(action.type){
      case ActionType.BILLING_UPDATE_SUBSCRIPTION_REQUEST:
        return true

      case ActionType.BILLING_UPDATE_SUBSCRIPTION_FAILED:
        return false

      case ActionType.BILLING_UPDATE_SUBSCRIPTION_SUCCESS:
        return action.meta.updateType == "cancel" ? state : false

      default:
        return state
    }
  },

  isUpdatingStripeCard = (state = false, action)=>{
    switch(action.type){
      case ActionType.BILLING_UPDATE_CARD_REQUEST:
        return true

      case ActionType.BILLING_UPDATE_CARD_SUCCESS:
      case ActionType.BILLING_UPDATE_CARD_FAILED:
        return false

      default:
        return state
    }
  },

  invoices = (state = null, action)=>{
    switch(action.type){
      case ActionType.LOGIN:
      case ActionType.LOGIN_REQUEST:
      case ActionType.REGISTER:
      case ActionType.LOGOUT:
      case ActionType.ORG_INVALID:
      case ActionType.SELECT_ACCOUNT:
      case ActionType.BILLING_FETCH_INVOICE_LIST_REQUEST:
        return null

      case ActionType.BILLING_FETCH_INVOICE_LIST_SUCCESS:
        return indexById(action.payload)

      default:
        return state
    }
  },

  isLoadingInvoices = (state = false, action)=>{
    switch(action.type){
      case ActionType.BILLING_FETCH_INVOICE_LIST_REQUEST:
        return true

      case ActionType.BILLING_FETCH_INVOICE_LIST_SUCCESS:
      case ActionType.BILLING_FETCH_INVOICE_LIST_FAILED:
        return false

      default:
        return state
    }
  },

  isLoadingInvoicePdf = (state = {}, action)=> {
    switch(action.type){
      case ActionType.BILLING_FETCH_INVOICE_PDF:
        return R.assoc(action.payload.id, true, state)

      case ActionType.BILLING_SAVE_INVOICE_PDF_SUCCESS:
      case ActionType.BILLING_SAVE_INVOICE_PDF_FAILED:
      case ActionType.BILLING_FETCH_INVOICE_PDF_FAILED:
        return R.dissoc(action.meta.requestPayload.id, state)

      default:
        return state
    }
  }