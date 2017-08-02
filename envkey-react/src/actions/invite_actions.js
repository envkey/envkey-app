import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  ACCEPT_INVITE,
  ACCEPT_INVITE_REQUEST,
  LOAD_INVITE,
  LOAD_INVITE_REQUEST,
  VERIFY_INVITE_PARAMS,
  VERIFY_INVITE_EMAIL_REQUEST,
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

  loadInvite = createAction(LOAD_INVITE, R.pick(["identityHash", "passphrase"])),

  loadInviteRequest = createAction(LOAD_INVITE_REQUEST, R.always({}), R.pick(["identityHash"])),

  verifyInviteParams = createAction(VERIFY_INVITE_PARAMS, R.pick(["identityHash"])),

  verifyInviteEmailRequest = createAction(VERIFY_INVITE_EMAIL_REQUEST, R.pick(["emailVerificationCode"]), R.pick(["identityHash"]))
