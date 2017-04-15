import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  DECRYPT_ALL,
  DECRYPT_ENVS
} from './action_types'

export const

  decryptAll = createAction(DECRYPT_ALL, R.pick(["password"]), R.pick(["firstTarget"])),

  decryptEnvs = createAction(DECRYPT_ENVS, R.always({}), R.pick(["objectType", "targetId", "decryptAllAction"]))
