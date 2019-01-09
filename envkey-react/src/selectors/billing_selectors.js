import R from 'ramda'
import db from "envkey-client-core/dist/lib/db"
import {
  getApps,
  getCurrentOrg,
  getActiveUsers
} from 'envkey-client-core/dist/selectors'

db.init("invoices")

export const
  getStripeFormOpened = db.path("stripeFormOpened"),

  getIsUpdatingSubscription = db.path("isUpdatingSubscription"),

  getIsExceedingFreeTier = state => {
    const currentOrg = getCurrentOrg(state)
    if (!currentOrg || !currentOrg.freePlan)return false

    const {maxUsers, maxApps, maxKeysPerEnv} = currentOrg.freePlan

    return getApps(state).length > maxApps ||
           getActiveUsers(state).length > maxUsers // ||
           // getMostEnvKeysPerEnvironment(state) > maxKeysPerEnv
  },

  getInvoices = db.invoices.list({sortBy: 'createdAt', reverse: true}),

  getInvoice = db.invoices.find(),

  getIsLoadingInvoices = db.path("isLoadingInvoices"),

  getIsLoadingInvoicePdf = db.path("isLoadingInvoicePdf")
