import R from 'ramda'
import db from 'lib/db'

export const

  getIsInvitee = db.path("isInvitee"),

  getInvitedBy = db.path("invitedBy"),

  getInviteParams = db.path("inviteParams"),

  getInviteePubkey = db.path("inviteePubkey"),

  getInviteeEncryptedPrivkey = db.path("inviteeEncryptedPrivkey"),

  getInviteIdentityHash = db.path("inviteIdentityHash"),

  getInvitePassphrase = db.path("invitePassphrase"),

  getInviteParamsVerified = db.path("inviteParamsVerified"),

  getInviteParamsInvalid = db.path("inviteParamsInvalid"),

  getAcceptInviteEmailError = db.path("acceptInviteEmailError"),

  getIsGeneratingInviteLink = R.curry((parentId, state)=> db.path("isGeneratingInviteLink", parentId)(state)),

  getInvitingUser = R.curry((parentId, state)=> db.path("invitingUser", parentId)(state)),

  getGeneratedInviteLink = R.curry((parentId, state)=> db.path("generatedInviteLinks", parentId)(state))