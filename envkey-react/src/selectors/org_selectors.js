import db from 'lib/db'
import R from 'ramda'
import {
  getUser,
  getMostEnvKeysPerEnvironment,
  getActiveUsers,
  getApps
} from "./object_selectors"

db.init("orgs")

export const

  getCurrentOrgSlug = db.path("currentOrgSlug"),

  getOrgBySlug = db.orgs.findBy("slug"),

  getCurrentOrg = (state)=> getOrgBySlug(getCurrentOrgSlug(state), state),

  getOrgs = db.orgs.list({
    sortBy: o => [o.role == "org_owner" ? 0 : 1, Date.parse(o.accessStatus.timestamp)].join("-")
  }),

  getActiveOrgs = db.orgs.where({isActive: true}, {
    sortBy: o => [o.role == "org_owner" ? 0 : 1, Date.parse(o.accessStatus.timestamp)].join("-")
  }),

  getIsFetchingOrg = db.path("isFetchingOrg"),

  getIsUpdatingSubscription = db.path("isUpdatingSubscription"),

  getIsUpdatingStripeCard = db.path("isUpdatingStripeCard"),

  getIsCreatingOrg = db.path("isCreatingOrg"),

  getIsUpdatingOrgOwner = db.path("isUpdatingOrgOwner"),

  // getIsRemovingSelfFromOrg = db.path("isRemovingSelfFromOrg"),

  getStripeFormOpened = db.path("stripeFormOpened"),

  getIsExceedingFreeTier = state => {
    const currentOrg = getCurrentOrg(state)
    if (!currentOrg || !currentOrg.freePlan)return false

    const {maxUsers, maxApps, maxKeysPerEnv} = currentOrg.freePlan

    return getApps(state).length > maxApps ||
           getActiveUsers(state).length > maxUsers // ||
           // getMostEnvKeysPerEnvironment(state) > maxKeysPerEnv
  }