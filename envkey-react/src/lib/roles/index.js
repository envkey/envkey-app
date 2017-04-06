import {APP_ROLES, ORG_ROLES} from "constants"

export const

  orgRoleIndex = role => ORG_ROLES.indexOf(role),

  orgRolesGTE = role => ORG_ROLES.slice(orgRoleIndex(role)),

  orgRoleGTE = (role, minRole)=> orgRoleIndex(role) >= orgRoleIndex(minRole),

  orgRoleIsAdmin = role => orgRoleGTE(role, "org_admin"),

  appRoleIndex = role => APP_ROLES.indexOf(role),

  appRolesGTE = role => APP_ROLES.slice(appRoleIndex(role)),

  appRoleGTE = (role, minRole)=> appRoleIndex(role) >= appRoleIndex(minRole),

  appRoleIsAdmin = role => appRoleGTE(role, "admin"),

  appRoleHasProdAccess = role => appRoleGTE(role, "production")