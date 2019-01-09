import R from 'ramda'
import { takeLatest, take, put, select, call} from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { push } from 'react-router-redux'
import {apiSaga} from './helpers'
import {listenCardForm, openCardForm} from 'lib/billing'
import {
  getCurrentOrg,
  getActiveUsers,
  getPendingUsers,
  getPrivkey,
  getInvoice
} from 'selectors'
import {
  ActionType,

  billingUpdateSubscriptionRequest,
  billingUpdateCardRequest,

  billingFetchInvoicePdfRequest,

  fetchCurrentUserUpdates
} from "actions"
import isElectron from 'is-electron'
import moment from 'moment'

const
  onBillingUpdateSubscriptionRequest = apiSaga({
    authenticated: true,
    method: "patch",
    actionTypes: [ActionType.BILLING_UPDATE_SUBSCRIPTION_SUCCESS, ActionType.BILLING_UPDATE_SUBSCRIPTION_FAILED],
    urlSelector: getCurrentOrg,
    urlFn: (action, currentOrg)=> `/orgs/${currentOrg.id}/update_subscription.json`
  }),

  onBillingUpdateCardRequest = apiSaga({
    authenticated: true,
    method: "patch",
    actionTypes: [ActionType.BILLING_UPDATE_CARD_SUCCESS, ActionType.BILLING_UPDATE_CARD_FAILED],
    urlSelector: getCurrentOrg,
    urlFn: (action, currentOrg)=> `/orgs/${currentOrg.id}/update_stripe_card.json`
  }),

  onBillingFetchInvoiceListRequest = apiSaga({
    authenticated: true,
    method: "get",
    actionTypes: [ActionType.BILLING_FETCH_INVOICE_LIST_SUCCESS, ActionType.BILLING_FETCH_INVOICE_LIST_FAILED],
    urlFn: R.always('/invoices.json')
  }),

  onBillingFetchPdfRequest = apiSaga({
    authenticated: true,
    method: "get",
    responseType: "blob",
    actionTypes: [ActionType.BILLING_FETCH_INVOICE_PDF_SUCCESS, ActionType.BILLING_FETCH_INVOICE_PDF_FAILED],
    urlFn: ({payload: {id}})=> `/invoices/${id}.pdf`
  })

function *onAppLoaded(){
  listenCardForm()
}

function *onBillingUpgradeSubscription(){
  const currentOrg = yield select(getCurrentOrg),
        numUsersActive = (yield select(getActiveUsers)).length,
        numUsersPending = (yield select(getPendingUsers)).length,
        plan = currentOrg.businessPlan,
        subscription = currentOrg.subscription,
        privkey = yield select(getPrivkey)

  if (privkey){
    yield put(fetchCurrentUserUpdates())
    yield take(FETCH_CURRENT_USER_UPDATES_API_SUCCESS)
  }

  let error

  while (true){
    openCardForm("upgrade_subscription", {
      error,
      numUsersActive,
      numUsersPending,
      plan
    })

    let formResult = yield take([ActionType.BILLING_STRIPE_FORM_SUBMITTED, ActionType.BILLING_STRIPE_FORM_CLOSED])
    if (formResult.type == ActionType.BILLING_STRIPE_FORM_SUBMITTED){
      yield put(billingUpdateSubscriptionRequest({...formResult.payload, planId: currentOrg.businessPlan.id, updateType: "upgrade"}))
    }

    let res = yield take([ActionType.BILLING_UPDATE_SUBSCRIPTION_SUCCESS, ActionType.BILLING_UPDATE_SUBSCRIPTION_FAILED])

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

  const res = yield take([ActionType.BILLING_UPDATE_SUBSCRIPTION_SUCCESS, ActionType.BILLING_UPDATE_SUBSCRIPTION_FAILED])

  if (!res.error){
    yield put(push(`/${currentOrg.slug}/my_org/billing`))
    yield call(delay, 500)
    window.location.reload()
  }
}

function* onBillingUpdateCard(){
  let error

  while (true){
    openCardForm("update_payment", {error})

    let formResult = yield take([ActionType.BILLING_STRIPE_FORM_SUBMITTED, ActionType.BILLING_STRIPE_FORM_CLOSED])
    if (formResult.type == ActionType.BILLING_STRIPE_FORM_SUBMITTED){
      let currentOrg = yield select(getCurrentOrg)
      yield put(billingUpdateCardRequest(formResult.payload))
    }

    let res = yield take([ActionType.BILLING_UPDATE_CARD_SUCCESS, ActionType.BILLING_UPDATE_CARD_FAILED])

    if (res.error){
      error = R.path(["payload", "response", "data", "message"], res)
    } else {
      break
    }
  }
}

function saveFile(invoice){
  return new Promise(resolve => {
    window.dialog.showSaveDialog({
      title: 'Save Invoice',
      defaultPath: `envkey-invoice-${moment(invoice.createdAt).format("YYYY-MM-DD")}.pdf`
    }, resolve)
  })
}

function writeFile(filename, data){
  const fileReader = new FileReader()

  return new Promise(resolve => {
    fileReader.onload = function() {
      fs.writeFile(
        filename,
        Buffer.from(new Uint8Array(this.result)),
        resolve
      )
    }
    fileReader.readAsArrayBuffer(data)
  })
}

function* onBillingFetchPdf(action){
  if (!isElectron()){
    return
  }

  yield put(billingFetchInvoicePdfRequest(action.payload))

  const invoice = yield select(getInvoice(action.payload.id))


  const [filename, fetchRes] = yield [
    saveFile(invoice),
    take([ActionType.BILLING_FETCH_INVOICE_PDF_SUCCESS, ActionType.BILLING_FETCH_INVOICE_PDF_FAILED])
  ]

  if (fetchRes.error){
    return
  }

  const writeErr = yield writeFile(filename, fetchRes.payload)

  if(writeErr){
    alert(`An error ocurred saving ${filename}: ${writeErr.message}`)
    yield put({
      type: ActionType.BILLING_SAVE_INVOICE_PDF_FAILED,
      error: true,
      payload: writeErr,
      meta: fetchRes.meta
    })
  } else {
    yield put({
      type: ActionType.BILLING_SAVE_INVOICE_PDF_SUCCESS,
      meta: fetchRes.meta
    })
  }
}


export default function* billingSagas(){
  yield [
    takeLatest(ActionType.APP_LOADED, onAppLoaded),
    takeLatest(ActionType.BILLING_UPDATE_CARD, onBillingUpdateCard),
    takeLatest(ActionType.BILLING_UPGRADE_SUBSCRIPTION, onBillingUpgradeSubscription),
    takeLatest(ActionType.BILLING_CANCEL_SUBSCRIPTION, onBillingCancelSubscription),
    takeLatest(ActionType.BILLING_UPDATE_SUBSCRIPTION_REQUEST, onBillingUpdateSubscriptionRequest),
    takeLatest(ActionType.BILLING_UPDATE_CARD_REQUEST, onBillingUpdateCardRequest),
    takeLatest(ActionType.BILLING_FETCH_INVOICE_LIST_REQUEST, onBillingFetchInvoiceListRequest),
    takeLatest(ActionType.BILLING_FETCH_INVOICE_PDF, onBillingFetchPdf),
    takeLatest(ActionType.BILLING_FETCH_INVOICE_PDF_REQUEST, onBillingFetchPdfRequest)
  ]
}

