import { createAction } from 'redux-actions'
import R from 'ramda'
import {decamelize} from 'xcase'
import {
  CREATE_OBJECT_REQUEST,
  RENAME_OBJECT_REQUEST,
  REMOVE_OBJECT_REQUEST,
  UPDATE_OBJECT_SETTINGS_REQUEST
} from './action_types'

const pickMeta = R.pick(["objectType", "targetId"]),
      payloadFn = ({objectType, params})=> ({[decamelize(objectType)]: params})

export const

  createObject = createAction(CREATE_OBJECT_REQUEST, payloadFn, pickMeta),

  renameObject = createAction(RENAME_OBJECT_REQUEST, payloadFn, pickMeta),

  removeObject = createAction(REMOVE_OBJECT_REQUEST, R.always({}), pickMeta),

  updateObjectSettings = createAction(UPDATE_OBJECT_SETTINGS_REQUEST, payloadFn, pickMeta)





