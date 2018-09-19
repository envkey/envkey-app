import {
  LOGIN,
  LOGIN_REQUEST,
  REGISTER,
  LOGOUT,
  ORG_INVALID,
  SELECT_ACCOUNT,
  BILLING_UPGRADE_SUBSCRIPTION,
  BILLING_OPEN_STRIPE_FORM,
  BILLING_STRIPE_FORM_SUBMITTED,
  BILLING_STRIPE_FORM_CLOSED,
  BILLING_UPDATE_SUBSCRIPTION_REQUEST,
  BILLING_UPDATE_SUBSCRIPTION_SUCCESS,
  BILLING_UPDATE_SUBSCRIPTION_FAILED,
  BILLING_UPDATE_CARD_REQUEST,
  BILLING_UPDATE_CARD_SUCCESS,
  BILLING_UPDATE_CARD_FAILED,
  BILLING_FETCH_INVOICE_LIST_REQUEST,
  BILLING_FETCH_INVOICE_LIST_SUCCESS,
  BILLING_FETCH_INVOICE_LIST_FAILED,
  BILLING_FETCH_INVOICE_PDF,
  BILLING_FETCH_INVOICE_PDF_SUCCESS,
  BILLING_FETCH_INVOICE_PDF_FAILED,
  BILLING_SAVE_INVOICE_PDF_SUCCESS,
  BILLING_SAVE_INVOICE_PDF_FAILED
} from "actions"
import R from 'ramda'
import { orgs as coreOrgsReducer } from "envkey-client-core/dist/reducers/org_reducers"
import {indexById} from 'envkey-client-core/dist/lib/fn'

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
  },

  invoices = (state = null, action)=>{
    switch(action.type){
      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case LOGOUT:
      case ORG_INVALID:
      case SELECT_ACCOUNT:
      case BILLING_FETCH_INVOICE_LIST_REQUEST:
        return null

      case BILLING_FETCH_INVOICE_LIST_SUCCESS:
        return indexById(action.payload)

      default:
        return state
    }
  },

  isLoadingInvoices = (state = false, action)=>{
    switch(action.type){
      case BILLING_FETCH_INVOICE_LIST_REQUEST:
        return true

      case BILLING_FETCH_INVOICE_LIST_SUCCESS:
      case BILLING_FETCH_INVOICE_LIST_FAILED:
        return false

      default:
        return state
    }
  },

  isLoadingInvoicePdf = (state = {}, action)=> {
    switch(action.type){
      case BILLING_FETCH_INVOICE_PDF:
        return R.assoc(action.payload.id, true, state)

      case BILLING_SAVE_INVOICE_PDF_SUCCESS:
      case BILLING_SAVE_INVOICE_PDF_FAILED:
      case BILLING_FETCH_INVOICE_PDF_FAILED:
        return R.dissoc(action.meta.requestPayload.id, state)

      default:
        return state
    }
  }