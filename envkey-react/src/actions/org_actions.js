import R from 'ramda'
import {
  SELECT_ORG,
  UPDATE_ORG_ROLE,
  UPDATE_ORG_ROLE_REQUEST,
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

  createOrg = createAction(CREATE_ORG_REQUEST, (params)=> ({org: params}) )