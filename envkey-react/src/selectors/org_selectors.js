import db from 'lib/db'
import {getUser} from "./object_selectors"

export const

  getCurrentOrgSlug = db.path("currentOrgSlug"),

  getCurrentOrg = (state)=> db("orgs").findBy("slug")(getCurrentOrgSlug(state), state),

  getOrgs = db("orgs").list(),

  isFetchingOrg = db.path("isFetchingOrg")