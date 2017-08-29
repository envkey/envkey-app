import { takeLatest, take, put, select, call} from 'redux-saga/effects'
import {apiSaga} from './helpers'
import {listenCardForm, openCardForm} from 'lib/billing'
import {getCurrentOrg} from 'selectors'
import {
  APP_LOADED,

  BILLING_UPGRADE_SUBSCRIPTION,
  BILLING_CANCEL_SUBSCRIPTION,
  BILLING_UPDATE_CARD,

  BILLING_STRIPE_FORM_SUBMITTED,
  BILLING_STRIPE_FORM_CLOSED,

  BILLING_UPDATE_SUBSCRIPTION_REQUEST,
  BILLING_UPDATE_SUBSCRIPTION_SUCCESS,
  BILLING_UPDATE_SUBSCRIPTION_FAILED,

  BILLING_UPDATE_CARD_REQUEST,
  BILLING_UPDATE_CARD_SUCCESS,
  BILLING_UPDATE_CARD_FAILED,

  billingUpdateSubscriptionRequest,
  billingUpdateCardRequest

} from "actions"

const
  onBillingUpdateSubscriptionRequest = apiSaga({
    authenticated: true,
    method: "patch",
    actionTypes: [BILLING_UPDATE_SUBSCRIPTION_SUCCESS, BILLING_UPDATE_SUBSCRIPTION_FAILED],
    urlSelector: getCurrentOrg,
    urlFn: (action, currentOrg)=> `/orgs/${currentOrg.id}/update_subscription.json`
  }),

  onBillingUpdateCardRequest = apiSaga({
    authenticated: true,
    method: "patch",
    actionTypes: [BILLING_UPDATE_CARD_SUCCESS, BILLING_UPDATE_CARD_FAILED],
    urlSelector: getCurrentOrg,
    urlFn: (action, currentOrg)=> `/orgs/${currentOrg.id}/update_stripe_card.json`
  })

function *onAppLoaded(){
  listenCardForm()
}

function *onBillingUpgradeSubscription(){
  openCardForm()
  const formResult = yield take([BILLING_STRIPE_FORM_SUBMITTED, BILLING_STRIPE_FORM_CLOSED])
  if (formResult.type == BILLING_STRIPE_FORM_SUBMITTED){
    const currentOrg = yield select(getCurrentOrg)
    yield put(billingUpdateSubscriptionRequest({...formResult.payload, planId: currentOrg.businessPlan.id}))
  }
}

function* onBillingCancelSubscription(){
  const currentOrg = yield select(getCurrentOrg)
  yield put(billingUpdateSubscriptionRequest({planId: currentOrg.freePlan.id}))

  const res = yield take([BILLING_UPDATE_SUBSCRIPTION_SUCCESS, BILLING_UPDATE_SUBSCRIPTION_FAILED])

  if (!res.error){
    window.location.reload()
  }
}

function* onBillingUpdateCard(){
  openCardForm()
  const formResult = yield take([BILLING_STRIPE_FORM_SUBMITTED, BILLING_STRIPE_FORM_CLOSED])
  if (formResult.type == BILLING_STRIPE_FORM_SUBMITTED){
    const currentOrg = yield select(getCurrentOrg)
    yield put(billingUpdateCardRequest(formResult.payload))
  }
}

export default function* billingSagas(){
  yield [
    takeLatest(APP_LOADED, onAppLoaded),
    takeLatest(BILLING_UPDATE_CARD, onBillingUpdateCard),
    takeLatest(BILLING_UPGRADE_SUBSCRIPTION, onBillingUpgradeSubscription),
    takeLatest(BILLING_CANCEL_SUBSCRIPTION, onBillingCancelSubscription),
    takeLatest(BILLING_UPDATE_SUBSCRIPTION_REQUEST, onBillingUpdateSubscriptionRequest),
    takeLatest(BILLING_UPDATE_CARD_REQUEST, onBillingUpdateCardRequest)
  ]
}

