import R from 'ramda'
import pluralize from 'pluralize'

import {
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS,
  REGISTER_SUCCESS,
  LOAD_INVITE_API_SUCCESS,
  ACCEPT_INVITE_SUCCESS,
  CREATE_ORG_SUCCESS,

  LOAD_INVITE_REQUEST,
  LOGIN,
  LOGIN_REQUEST,
  LOGOUT,
  TOKEN_INVALID,
  SELECT_ACCOUNT,
  SELECT_ORG,
  REGISTER,
  RESET_SESSION
} from "actions/action_types"

export const
  // Everything except Org
  ORG_OBJECT_TYPES = [
    "app",
    "user",
    "orgUser",
    "appUser",
    "server",
    "localKey"
  ],

  ORG_OBJECT_TYPES_PLURALIZED = ORG_OBJECT_TYPES.map(s => pluralize(s)),

  SLUGGABLE_ORG_OBJECT_TYPES = R.difference(
    ORG_OBJECT_TYPES,
    ["orgUser", "appUser", "server"]
  ),

  APP_ROLES = ["development", "production", "admin", "org_admin", "org_owner"],

  ORG_ROLES = ["basic", "org_admin", "org_owner"],

  TRUSTED_PUBKEY_PROPS = ["pubkeyFingerprint", "invitePubkeyFingerprint", "invitedById", "keyGeneratedById"],

  LOCAL_PERSISTENCE_AUTH_KEYS = ["auth", "accounts", "currentOrgSlug"],

  SESSION_PERSISTENCE_AUTH_KEYS = ["privkey", "accountPrivkeys"],

  AUTH_KEYS= LOCAL_PERSISTENCE_AUTH_KEYS.concat(SESSION_PERSISTENCE_AUTH_KEYS),

  FETCH_CURRENT_USER_ACTION_TYPES = [
    FETCH_CURRENT_USER_SUCCESS,
    FETCH_CURRENT_USER_UPDATES_API_SUCCESS,
    REGISTER_SUCCESS,
    LOAD_INVITE_API_SUCCESS,
    ACCEPT_INVITE_SUCCESS,
    CREATE_ORG_SUCCESS
  ],

  RESET_SESSION_ACTION_TYPES = [
    LOAD_INVITE_REQUEST,
    LOGIN,
    LOGIN_REQUEST,
    LOGOUT,
    TOKEN_INVALID,
    SELECT_ORG,
    REGISTER,
    SELECT_ACCOUNT,
    RESET_SESSION
  ]


