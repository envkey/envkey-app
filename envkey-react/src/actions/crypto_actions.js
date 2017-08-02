import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  DECRYPT_ALL,
  DECRYPT_ENVS,
  UPDATE_TRUSTED_PUBKEYS,
  VERIFY_ORG_PUBKEYS,
  VERIFY_TRUSTED_PUBKEYS,
  VERIFY_CURRENT_USER_PUBKEY,
  ADD_TRUSTED_PUBKEY,
  DECRYPT_PRIVKEY
} from './action_types'
import { TRUSTED_PUBKEY_PROPS } from 'constants'

export const

  decryptAll = createAction(DECRYPT_ALL, R.pick(["password"]), R.pick(["firstTarget"])),

  decryptPrivkey = createAction(DECRYPT_PRIVKEY, R.pick(["password"])),

  decryptEnvs = createAction(DECRYPT_ENVS, R.always({}), R.pick(["objectType", "targetId", "decryptAllAction"])),

  updateTrustedPubkeys = createAction(UPDATE_TRUSTED_PUBKEYS, R.always({}), R.pick(["orgSlug"])),

  verifyOrgPubkeys = createAction(VERIFY_ORG_PUBKEYS),

  verifyTrustedPubkeys = createAction(VERIFY_TRUSTED_PUBKEYS),

  verifyCurrentUserPubkey = createAction(VERIFY_CURRENT_USER_PUBKEY),

  addTrustedPubkey = createAction(
    ADD_TRUSTED_PUBKEY,
    R.pipe(
      R.prop("keyable"),
      R.pick(TRUSTED_PUBKEY_PROPS)
    ),
    ({orgId, keyable: {id}})=> ({orgId, keyableId: id})
  )