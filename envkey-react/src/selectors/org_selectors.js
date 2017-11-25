import db from 'lib/db'
import R from 'ramda'
import {getUser} from "./object_selectors"

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

  getIsCreatingOrg = db.path("isCreatingOrg")