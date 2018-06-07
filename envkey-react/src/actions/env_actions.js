import { createAction } from 'redux-actions'
import R from 'ramda'
import uuid from 'uuid'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,
  UPDATE_ENV_REQUEST,
  GENERATE_ENV_UPDATE_ID,
  CLEAR_PENDING_ENV_UPDATE,
  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
  RENAME_SUB_ENV,
  GRANT_ENV_ACCESS_REQUEST
} from './action_types'

const metaKeys = ["parent", "parentType", "parentId", "timestamp", "importAction", "environment", "id"],
      pickMeta = R.pick(metaKeys)

export const

  createEntry = createAction(CREATE_ENTRY, R.pick(["entryKey", "vals", "subEnvId"]), pickMeta),

  updateEntry = createAction(UPDATE_ENTRY, R.pick(["entryKey", "newKey", "subEnvId"]), pickMeta),

  removeEntry = createAction(REMOVE_ENTRY, R.pick(["entryKey", "subEnvId"]), pickMeta),

  updateEntryVal = createAction(UPDATE_ENTRY_VAL, R.pick(["entryKey", "environment", "update", "subEnvId"]), pickMeta),

  updateEnvRequest = createAction(
    UPDATE_ENV_REQUEST,
    R.pick(["envs", "signedByTrustedPubkeys", "envUpdateId"]),
    R.pipe(
      R.pick(metaKeys.concat([
       "envUpdateId",
       "envActionsPending",
       "updatedEnvsWithMeta",
       "skipDelay",
       "forceEnvUpdateId",
       "isOutdatedEnvsRequest"
      ])),
      R.over(R.lensProp("nextEnvUpdateId"), uuid)
    ),
  ),

  generateEnvUpdateId = createAction(GENERATE_ENV_UPDATE_ID, uuid, pickMeta),

  clearPendingEnvUpdate = createAction(CLEAR_PENDING_ENV_UPDATE, R.always({}), R.pick(["parentId", "envUpdateId"])),

  addSubEnv = createAction(
    ADD_SUB_ENV,
    R.pipe(
      R.pick(["environment", "name"]),
      R.over(R.lensProp("id"), uuid)
    ),
    pickMeta
  ),

  removeSubEnv = createAction(REMOVE_SUB_ENV, R.pick(["environment", "id"]), pickMeta),

  renameSubEnv = createAction(RENAME_SUB_ENV, R.pick(["environment", "id", "name"]), pickMeta),

  grantEnvAccessRequest = createAction(
    GRANT_ENV_ACCESS_REQUEST,
    R.pick(['envs']),
    R.pick(['orgUserId', 'userId'])
  )



