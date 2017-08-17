import { createAction } from 'redux-actions'
import R from 'ramda'
import uuid from 'uuid'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,
  UPDATE_ENV_REQUEST,
  GENERATE_ENV_UPDATE_ID
} from './action_types'

const metaKeys = ["parent", "parentType", "parentId", "timestamp", "importAction"],
      pickMeta = R.pick(metaKeys)

export const

  createEntry = createAction(CREATE_ENTRY, R.pick(["entryKey", "vals"]), pickMeta),

  updateEntry = createAction(UPDATE_ENTRY, R.pick(["entryKey", "newKey"]), pickMeta),

  removeEntry = createAction(REMOVE_ENTRY, R.pick(["entryKey"]), pickMeta),

  updateEntryVal = createAction(UPDATE_ENTRY_VAL, R.pick(["entryKey", "environment", "update"]), pickMeta),

  updateEnvRequest = createAction(
    UPDATE_ENV_REQUEST,
    R.pick(["envs", "signedByTrustedPubkeys", "envsUpdatedAt", "keyablesUpdatedAt", "envUpdateId"]),
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

  generateEnvUpdateId = createAction(GENERATE_ENV_UPDATE_ID, uuid, pickMeta)
