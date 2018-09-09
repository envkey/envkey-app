import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  ACCEPT_INVITE,
  ACCEPT_INVITE_REQUEST,
  RESET_ACCEPT_INVITE,
  VERIFY_INVITE_PARAMS,
  CLOSE_GENERATED_INVITE_LINK,
  LOAD_INVITE_REQUEST,
  REFRESH_INVITE_REQUEST,
  REVOKE_INVITE,
  REGEN_INVITE,
  INVITE_EXISTING_USER_INVALID_PASSPHRASE
} from './action_types'

export const

  closeGeneratedInviteLink = createAction(CLOSE_GENERATED_INVITE_LINK, R.always({}), R.pick(["parentId"])),

  loadInviteRequest = createAction(LOAD_INVITE_REQUEST, R.pick(["emailVerificationCode"]), R.pick(["passphrase", "identityHash"])),

  refreshInviteRequest = createAction(REFRESH_INVITE_REQUEST, R.pick(["emailVerificationCode"]), R.pick(["identityHash"])),

  acceptInvite = createAction(ACCEPT_INVITE, R.pick(["password"])),

  acceptInviteRequest = createAction(
    ACCEPT_INVITE_REQUEST,
    R.pipe(
      R.pick(["user", "orgUser", "envs", "emailVerificationCode", "inviteUpdatedAt"]),
      R.evolve({
        user: R.pick(["password", "pubkey", "pubkeyFingerprint", "encryptedPrivkey"]),
        orgUser: R.pick(["pubkey", "signedTrustedPubkeys"])
      })
    ),
    R.pick(["identityHash", "password", "email", "orgSlug", "currentUserId"])
  ),

  verifyInviteParams = createAction(VERIFY_INVITE_PARAMS),

  resetAcceptInvite = createAction(RESET_ACCEPT_INVITE),

  revokeInvite = createAction(REVOKE_INVITE, R.pick(["userId"])),

  regenInvite = createAction(REGEN_INVITE, R.pick(["userId"]), R.pick(["appId"]))
