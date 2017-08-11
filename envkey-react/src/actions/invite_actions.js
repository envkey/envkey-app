import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  ACCEPT_INVITE,
  ACCEPT_INVITE_REQUEST,
  VERIFY_INVITE_PARAMS,
  CLOSE_GENERATED_INVITE_LINK
} from './action_types'

export const

  closeGeneratedInviteLink = createAction(CLOSE_GENERATED_INVITE_LINK, R.always({}), R.pick(["parentId"])),

  acceptInvite = createAction(ACCEPT_INVITE, R.pick(["password"])),

  acceptInviteRequest = createAction(
    ACCEPT_INVITE_REQUEST,
    R.pipe(
      R.pick(["user", "orgUser", "envs"]),
      R.evolve({
        user: R.pick(["password", "pubkey", "pubkeyFingerprint", "encryptedPrivkey"]),
        orgUser: R.pick(["pubkey", "signedTrustedPubkeys"])
      })
    ),
    R.pick(["identityHash", "rawPassword", "hashedPassword", "email", "orgSlug"])
  ),

  verifyInviteParams = createAction(VERIFY_INVITE_PARAMS, R.pick(["identityHash"]))