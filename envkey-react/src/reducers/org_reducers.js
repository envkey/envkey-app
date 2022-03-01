import {isClearSessionAction} from './helpers'
import {
  SELECT_ORG,
  SELECT_ACCOUNT,
  SELECT_ACCOUNT_SUCCESS,
  FETCH_CURRENT_USER_SUCCESS,
  LOGIN,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  REGISTER,
  REGISTER_SUCCESS,
  CREATE_ORG_REQUEST,
  CREATE_ORG_SUCCESS,
  CREATE_ORG_FAILED,
  LOGOUT,
  ORG_INVALID,
  LOAD_INVITE_API_SUCCESS,
  ACCEPT_INVITE_SUCCESS,
  RENAME_OBJECT_SUCCESS,
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
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS,
  UPDATE_ORG_OWNER_REQUEST,
  UPDATE_ORG_OWNER_SUCCESS,
  UPDATE_ORG_OWNER_FAILED,
  BILLING_FETCH_INVOICE_LIST_REQUEST,
  BILLING_FETCH_INVOICE_LIST_SUCCESS,
  BILLING_FETCH_INVOICE_LIST_FAILED,
  BILLING_FETCH_INVOICE_PDF,
  BILLING_FETCH_INVOICE_PDF_SUCCESS,
  BILLING_FETCH_INVOICE_PDF_FAILED,
  BILLING_SAVE_INVOICE_PDF_SUCCESS,
  BILLING_SAVE_INVOICE_PDF_FAILED,
  UPDATE_OBJECT_SETTINGS_SUCCESS,
  UPDATE_NETWORK_SETTINGS_SUCCESS,
  EXPORT_ORG,
  EXPORT_ORG_SUCCESS,
  EXPORT_ORG_FAILED
} from "actions"
import R from 'ramda'
import {indexById} from './helpers'

export const
  currentOrgSlug = (state = null, action)=>{
    switch(action.type){
      case SELECT_ORG:
        return action.payload

      case LOAD_INVITE_API_SUCCESS:
        return action.payload.org.slug

      case REGISTER_SUCCESS:
      case CREATE_ORG_SUCCESS:
        let orgs = action.payload.orgs
        return orgs[orgs.length - 1].slug

      case ACCEPT_INVITE_SUCCESS:
        return action.meta.orgSlug

      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case LOGOUT:
      case ORG_INVALID:
      case SELECT_ACCOUNT:
        return null

      default:
        return state
    }
  },

  orgs = (state = {}, action)=>{
    switch(action.type){
      case FETCH_CURRENT_USER_SUCCESS:
      case LOGIN_SUCCESS:
      case REGISTER_SUCCESS:
      case CREATE_ORG_SUCCESS:
      case ACCEPT_INVITE_SUCCESS:
      case SELECT_ACCOUNT_SUCCESS:
        return indexById(action.payload.orgs)

      case LOAD_INVITE_API_SUCCESS:
        return indexById([action.payload.org])

      case FETCH_CURRENT_USER_UPDATES_API_SUCCESS:
        if (action.meta && action.meta.noMinUpdatedAt){
          return action.payload.orgs ? indexById(action.payload.orgs) : state
        } else {
          return action.payload.orgs && action.payload.orgs.length ? {...state, ...indexById(action.payload.orgs)} : state
        }

      case BILLING_UPDATE_CARD_SUCCESS:
      case BILLING_UPDATE_SUBSCRIPTION_SUCCESS:
        return R.assoc(action.payload.id, action.payload, state)

      case RENAME_OBJECT_SUCCESS:
      case UPDATE_OBJECT_SETTINGS_SUCCESS:
      case UPDATE_NETWORK_SETTINGS_SUCCESS:
        if (action.meta.objectType == "org"){
          return R.assoc(action.payload.id, action.payload, state)
        } else {
          return state
        }

      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case LOGOUT:
      case SELECT_ACCOUNT:
        return {}

      default:
        return state
    }
  },

  orgsLoaded = (state = false, action)=>{
    switch(action.type){
      case FETCH_CURRENT_USER_SUCCESS:
      case LOGIN_SUCCESS:
      case REGISTER_SUCCESS:
      case CREATE_ORG_SUCCESS:
      case ACCEPT_INVITE_SUCCESS:
      case SELECT_ACCOUNT_SUCCESS:
        return true

      case LOGIN:
      case LOGIN_REQUEST:
      case REGISTER:
      case LOGOUT:
      case SELECT_ACCOUNT:
        return false

      default:
        return state
    }
  },

  isCreatingOrg = (state=false, action)=>{
    switch (action.type){
      case CREATE_ORG_REQUEST:
        return true

      case CREATE_ORG_SUCCESS:
      case CREATE_ORG_FAILED:
        return false

      default:
        return state
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

  isUpdatingOrgOwner = (state = false, action)=>{
    switch(action.type){
      case UPDATE_ORG_OWNER_REQUEST:
        return true

      case UPDATE_ORG_OWNER_SUCCESS:
      case UPDATE_ORG_OWNER_FAILED:
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
  },

  isExportingOrg = (state = false, action)=> {
    switch(action.type){
      case EXPORT_ORG:
        return true

      case EXPORT_ORG_SUCCESS:
      case EXPORT_ORG_FAILED:
        return false

      default:
        return state
    }
  },

  exportOrgErr = (state=null, action)=> {
    if (isClearSessionAction(action)){
      return null
    }

    switch(action.type){
      case EXPORT_ORG:
        return null

      case EXPORT_ORG_FAILED:
        return action.payload

      default:
        return state
    }
  }
