import { createAction } from 'redux-actions'
import R from 'ramda'
import { ActionType } from './action_types'

export const

  billingUpgradeSubscription = createAction(ActionType.BILLING_UPGRADE_SUBSCRIPTION),

  billingUpdateSubscriptionRequest = createAction(ActionType.BILLING_UPDATE_SUBSCRIPTION_REQUEST, R.pick(["stripeToken", "planId", "retainUserIds", "retainAppIds"]), R.pick(["updateType"])),

  billingCancelSubscription = createAction(ActionType.BILLING_CANCEL_SUBSCRIPTION, R.pick(["retainUserIds", "retainAppIds"])),

  billingUpdateCard = createAction(ActionType.BILLING_UPDATE_CARD),

  billingUpdateCardRequest = createAction(ActionType.BILLING_UPDATE_CARD_REQUEST, R.pick(["stripeToken"])),

  billingStripeFormSubmitted = createAction(ActionType.BILLING_STRIPE_FORM_SUBMITTED, R.pick(["stripeToken"])),

  billingStripeFormClosed = createAction(ActionType.BILLING_STRIPE_FORM_CLOSED),

  billingFetchInvoiceList = createAction(ActionType.BILLING_FETCH_INVOICE_LIST_REQUEST),

  billingFetchInvoicePdf = createAction(ActionType.BILLING_FETCH_INVOICE_PDF),

  billingFetchInvoicePdfRequest = createAction(
    ActionType.BILLING_FETCH_INVOICE_PDF_REQUEST,
    R.pick(["id"]),
    R.pick(["filename"])
  )
