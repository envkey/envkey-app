import R from 'ramda'
import { takeLatest, take, put, select, call} from 'redux-saga/effects'
import {apiSaga} from './helpers'
import {listenCardForm, openCardForm} from 'lib/billing'
import {
  getCurrentOrg,
  getActiveUsers,
  getPendingUsers
} from 'selectors'
import {
  APP_LOADED,
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS,

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
        numUsersActive = (yield select(getActiveUsers)).length,
        numUsersPending = (yield select(getPendingUsers)).length,
        plan = currentOrg.businessPlan,
        subscription = currentOrg.subscription

  yield put(fetchCurrentUserUpdates())
  yield take(FETCH_CURRENT_USER_UPDATES_API_SUCCESS)

  let error

  while (true){
    openCardForm("upgrade_subscription", {
      error,
      numUsersActive,
      numUsersPending,
      plan
    })

    let formResult = yield take([BILLING_STRIPE_FORM_SUBMITTED, BILLING_STRIPE_FORM_CLOSED])
    if (formResult.type == BILLING_STRIPE_FORM_SUBMITTED){
      yield put(billingUpdateSubscriptionRequest({...formResult.payload, planId: currentOrg.businessPlan.id, updateType: "upgrade"}))
    }

    let res = yield take([BILLING_UPDATE_SUBSCRIPTION_SUCCESS, BILLING_UPDATE_SUBSCRIPTION_FAILED])

    if (res.error){
      error = R.path(["payload", "response", "data", "message"], res)
    } else {
      break
    }
  }
}

function* onBillingCancelSubscription({payload}){
  const currentOrg = yield select(getCurrentOrg)
  let planId

  if (currentOrg.pricingVersion == 1 ){
    planId = currentOrug.freePlan.id
  } else {
    planId = currentOrg.trialStartedAt ? currentOrg.trialPlan.id : currentOrg.preTrialPlan.id
  }

  yield put(billingUpdateSubscriptionRequest({...payload, planId, updateType: "cancel"}))

  const res = yield take([BILLING_UPDATE_SUBSCRIPTION_SUCCESS, BILLING_UPDATE_SUBSCRIPTION_FAILED])

  if (!res.error){
    window.location.href = `/${currentOrg.slug}/my_org/billing`
  }
}

function* onBillingUpdateCard(){
  let error

  while (true){
    openCardForm("update_payment", {error})

    let formResult = yield take([BILLING_STRIPE_FORM_SUBMITTED, BILLING_STRIPE_FORM_CLOSED])
    if (formResult.type == BILLING_STRIPE_FORM_SUBMITTED){
      let currentOrg = yield select(getCurrentOrg)
      yield put(billingUpdateCardRequest(formResult.payload))
    }

    let res = yield take([BILLING_UPDATE_CARD_SUCCESS, BILLING_UPDATE_CARD_FAILED])

    if (res.error){
      error = R.path(["payload", "response", "data", "message"], res)
    } else {
      break
    }
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

