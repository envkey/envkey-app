import R from 'ramda'
import pluralize from 'pluralize'

export const
  // Everything except Org
  ORG_OBJECT_TYPES = [
    "app",
    "service",
    "user",
    "orgUser",
    "appUser",
    "appService",
    "server"
  ],

  ORG_OBJECT_TYPES_PLURALIZED = ORG_OBJECT_TYPES.map(s => pluralize(s)),

  SLUGGABLE_ORG_OBJECT_TYPES = R.difference(
    ORG_OBJECT_TYPES,
    ["orgUser", "appUser", "server", "appService"]
  ),

  APP_ROLES = ["development", "production", "admin", "org_admin", "org_owner"],

  ORG_ROLES = ["basic", "org_admin", "org_owner"],

  TRUSTED_PUBKEY_PROPS = ["pubkey", "invitePubkey", "invitedById", "signedById"]


