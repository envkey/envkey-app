import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL
} from './action_types'

const pickMeta = R.pick(["parent", "parentType", "parentId", "timestamp"])

export const

  createEntry = createAction(CREATE_ENTRY, R.pick(["entryKey", "vals"]), pickMeta),

  updateEntry = createAction(UPDATE_ENTRY, R.pick(["entryKey", "newKey"]), pickMeta),

  removeEntry = createAction(REMOVE_ENTRY, R.pick(["entryKey"]), pickMeta),

  updateEntryVal = createAction(UPDATE_ENTRY_VAL, R.pick(["entryKey", "environment", "update"]), pickMeta)
