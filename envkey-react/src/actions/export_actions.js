import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  EXPORT_ENVIRONMENT
} from './action_types'

export const

  exportEnvironment = createAction(
    EXPORT_ENVIRONMENT,
    R.pick(["environment", "format", "subEnvId", "subEnvName"]),
    R.pick(["parentType", "parentId", "environment"])
  )
