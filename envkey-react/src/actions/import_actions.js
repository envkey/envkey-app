import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  IMPORT_ENVIRONMENT,
  IMPORT_ALL_ENVIRONMENTS,
  COMMIT_IMPORT_ACTIONS
} from './action_types'

const pickMeta = R.pick(["parentType", "parentId", "noCommit", "envUpdateId", "isOnboardAction"])

export const

  importEnvironment = createAction(IMPORT_ENVIRONMENT, R.pick(["environment", "text", "format"]), pickMeta),

  importAllEnvironments = createAction(IMPORT_ALL_ENVIRONMENTS, R.pick(["textByEnvironment", "format"]), pickMeta),

  commitImportActions = createAction(COMMIT_IMPORT_ACTIONS, R.prop("importActionsPending"), pickMeta)