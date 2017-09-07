import db from 'lib/db'
import {getUser} from "./object_selectors"

db.init("orgs")

export const

  getCurrentOrgSlug = db.path("currentOrgSlug"),

  getOrgBySlug = db.orgs.findBy("slug"),

  getCurrentOrg = (state)=> getOrgBySlug(getCurrentOrgSlug(state), state),

  getOrgs = db.orgs.list(),

  getActiveOrgs = db.orgs.where({isActive: true}),

  getIsFetchingOrg = db.path("isFetchingOrg"),

  getIsUpdatingSubscription = db.path("isUpdatingSubscription"),

  getIsUpdatingStripeCard = db.path("isUpdatingStripeCard")

