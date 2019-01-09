import { createAction } from 'redux-actions'
import R from 'ramda'
import { ActionType } from './action_types'

export const

  exportEnvironment = createAction(
    ActionType.EXPORT_ENVIRONMENT,
    R.pick(["environment", "format", "subEnvId", "subEnvName"]),
    R.pick(["parentType", "parentId", "environment"])
  )
