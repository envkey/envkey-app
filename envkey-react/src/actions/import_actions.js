import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  QUEUE_ENVIRONMENT_IMPORT,
  IMPORT_ALL_ENVIRONMENTS,
  COMMIT_IMPORT_ACTIONS,
  IMPORT_SINGLE_ENVIRONMENT
} from './action_types'

const pickMeta = R.pick(["parentType", "parentId", "envUpdateId", "isOnboardAction", "environment", "subEnvId"])

export const

  queueEnvironmentImport = createAction(QUEUE_ENVIRONMENT_IMPORT, R.pick(["environment", "subEnvId", "parsed"]), pickMeta),

  importAllEnvironments = createAction(IMPORT_ALL_ENVIRONMENTS, R.pick(["parsedByEnvironment"]), pickMeta),

  commitImportActions = createAction(COMMIT_IMPORT_ACTIONS, R.prop("importActionsPending"), pickMeta),

  importSingleEnvironment = createAction(IMPORT_SINGLE_ENVIRONMENT, R.pick(["environment", "subEnvId", "parsed"]), pickMeta)