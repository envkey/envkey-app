import R from 'ramda'
import { takeLatest, take, put, select, call} from 'redux-saga/effects'
import {apiSaga} from './helpers'
import {listenCardForm, openCardForm} from 'lib/billing'
import {getCurrentOrg, getActiveUsers} from 'selectors'
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
  billingUpdateCardRequest,

  fetchCurrentUserUpdates
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
  const currentOrg = yield select(getCurrentOrg),
        numUsers = (yield select(getActiveUsers)).length,
        plan = currentOrg.businessPlan,
        subscription = currentOrg.subscription

  yield put(fetchCurrentUserUpdates())

  openCardForm("upgrade_subscription", {
    numUsers,
    plan: R.pick(["amount", "name"], plan),
    subscription: R.pick(["status", "trialEndsAt", "currentPeriodEndsAt"], subscription)
  })
  const formResult = yield take([BILLING_STRIPE_FORM_SUBMITTED, BILLING_STRIPE_FORM_CLOSED])
  if (formResult.type == BILLING_STRIPE_FORM_SUBMITTED){

    yield put(billingUpdateSubscriptionRequest({...formResult.payload, planId: currentOrg.businessPlan.id, updateType: "upgrade"}))
  }
}

function* onBillingCancelSubscription(){
  const currentOrg = yield select(getCurrentOrg)
  yield put(billingUpdateSubscriptionRequest({planId: currentOrg.freePlan.id, updateType: "cancel"}))

  const res = yield take([BILLING_UPDATE_SUBSCRIPTION_SUCCESS, BILLING_UPDATE_SUBSCRIPTION_FAILED])

  if (!res.error){
    window.location.reload()
  }
}

function* onBillingUpdateCard(){
  openCardForm("update_payment")
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

