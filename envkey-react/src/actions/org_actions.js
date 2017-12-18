import R from 'ramda'
import {
  SELECT_ORG,
  UPDATE_ORG_ROLE,
  UPDATE_ORG_ROLE_REQUEST,
  UPDATE_ORG_OWNER_REQUEST,
  // REMOVE_SELF_FROM_ORG,
  CREATE_ORG_REQUEST
} from './action_types'
import { createAction } from 'redux-actions'

export const

  selectOrg = createAction(SELECT_ORG),

  updateOrgRole = createAction(UPDATE_ORG_ROLE),

  updateOrgRoleRequest = createAction(
    UPDATE_ORG_ROLE_REQUEST,
    ({envs, role, userId})=> ({orgUser: {role, userId}, envs}),
    R.pick(["orgUserId", "userId"])
  ),

  updateOrgOwner = createAction(UPDATE_ORG_OWNER_REQUEST, R.pick(["newOwnerId"])),

  // removeSelfFromOrg = createAction(REMOVE_SELF_FROM_ORG, R.always({}), R.pick(["newOwnerId"])),

  createOrg = createAction(CREATE_ORG_REQUEST, (params)=> ({org: params}) )