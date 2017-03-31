import {APP_ROLES, ORG_ROLES} from "constants"

export const

  orgRoleIndex = role => ORG_ROLES.indexOf(role),

  orgRolesGTE = role => ORG_ROLES.slice(orgRoleIndex(role)),

  orgRoleGTE = (role, minRole)=> orgRoleIndex(role) >= orgRoleIndex(minRole),

  orgRoleIsAdmin = role => orgRoleGTE(role, "org_admin")