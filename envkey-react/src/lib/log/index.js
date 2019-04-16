import R from 'ramda'
import {
  EXPORT_ENVIRONMENT,
  QUEUE_ENVIRONMENT_IMPORT,
  IMPORT_SINGLE_ENVIRONMENT
} from 'actions'

// Safe attributes to log

const
  STATE_WHITELIST = [
    // auth reducers
    "appLoaded",
    "disconnected",
    "verifyingEmail",
    "emailVerificationType",
    "isVerifyingEmail",
    "isVerifyingEmailCode",
    {
      verifyEmailError: sanitizeError,
      verifyEmailCodeError: sanitizeError
    },
    "isAuthenticating",
    "isAuthenticatingServer",
    {
      authError: sanitizeError,
      currentUserErr: sanitizeError
    },
    "isFetchingCurrentUser",
    "permissions",
    "orgRolesInvitable",
    "appEnvironmentsAccessible",
    "appEnvironmentsAssignable",
    "allowedIpsMergeStrategies",
    "resetAccountOptions",
    "isDemo",
    "demoDownloadUrl",

    // crypto reducers
    {
      updateEncryptedPrivkeyErr: sanitizeError,
      decryptPrivkeyErr: sanitizeError,
      decryptAllErr: sanitizeError
    },
    "isGeneratingUserKey",
    "signedTrustedPubkeys",
    {
      trustedPubkeys: R.map(R.omit(["invitePubkey", "pubkey"])) // fingerprints will suffice
    },

    // env reducers
    "isRequestingEnvUpdate",
    "isUpdatingOutdatedEnvs",
    "isRebasingOutdatedEnvs",
    "envUpdateId",
    "isGrantingEnvAccess",

    // import reducers
    "didOnboardImport",

    // invite reducers
    "isInvitee",
    "invitedBy",
    "inviteParamsVerified",
    "inviteParamsInvalid",
    {acceptInviteError: sanitizeError},
    "isGeneratingInviteLink",
    "invitingUser",
    "isLoadingInvite",
    {loadInviteError: sanitizeError},
    "inviteIdentityHash",
    // "inviteePubkey",
    "isRevokingInvite",
    "isRegeneratingInvite",

    // object reducers
    "selectedObjectType",
    "selectedObjectId",
    "onboardAppId",
    "orgUsers",
    {
      users: R.map(R.pick(["id", "deleted", "active", "pubkeyFingerprint", "invitePubkeyFingerprint", "email", "firstName", "lastName", "role"])),
      apps: R.map(R.pick(["id", "name", "role", "envsUpdatedAt", "keyablesUpdatedAt"])),
      appUsers: R.map(R.pick(["id", "userId", "appId", "role"])),
      servers: R.map(R.pick(["id", "name", "role", "subEnvId", "deleted", "active", "pubkeyFingerprint", "keyGeneratedById", "keyGeneratedAt"])),
      localKeys: R.map(R.pick(["id", "pubkeyFingerprint", "deleted", "active", "keyGeneratedAt"]))
    },

    // org reducers
    "currentOrgSlug",
    "orgs",
    "orgsLoaded",
    "isCreatingOrg",
    "stripeFormOpened",
    "isUpdatingSubscription",
    "isUpdatingStripeCard",
    "isUpdatingOrgOwner",
    "invoices",
    "isLoadingInvoices",
    "isLoadingInvoicePdf",

    // socket reducers
    "socketIsUpdatingEnvs",
    "socketEnvsStatus",

    // ui reducers
    "isCreating",
    "isAddingAssoc",
    "isRemoving",
    "isGeneratingAssocKey",
    "isRevokingAssocKey",
    "isUpdatingSettings",
    "isUpdatingNetworkSettings",
    "isUpdatingOrgRole",
    "isImportingConfig",
    "isRenaming",

    // react router
    "routing"
  ],

  ACTION_WHITELIST = [
    // assoc actions
    "parentType",
    "assocType",
    "joinType",
    "parentId",
    "assocId",
    "targetId",
    "isManyToMany",
    "role",
    "createOnly",
    "isCreatingAssoc",
    "subEnvId",
    "skipKeygen",
    "shouldPrefetchUpdates",
    "name",
    "undeletable",
    // "pubkey",
    "pubkeyFingerprint",

    // auth actions
    "email",
    "orgSlug",
    "accountId",
    "orgUser",

    // billing actions
    "stripeToken",
    "planId",
    "retainUserIds",
    "retainAppIds",
    "updateType",

    // crypto actions
    "background",
    "objectType",
    "targetId",
    "decryptAll",
    "orgSlug",
    "keyable",
    "orgId",

    // env actions
    "subEnvId",
    "signedByTrustedPubkeys",
    "envsUpdatedAt",
    "keyablesUpdatedAt",
    "envUpdateId",
    "skipDelay",
    "forceEnvUpdateId",
    "isOutdatedEnvsRequest",
    "nextEnvUpdateId",
    "id",

    // export actions
    [[EXPORT_ENVIRONMENT], ["format", "environment"]],

    // import actions
    [[QUEUE_ENVIRONMENT_IMPORT, IMPORT_SINGLE_ENVIRONMENT], ["environment"]],

    // invite actions
    "identityHash",
    {user: R.pick(["pubkeyFingerprint"])},
    "currentUserId",
    "userId",
    "appId",

    // object actions
    "decryptEnvs", // boolean, not sensitive
    "socketUpdate", // boolean, not sensitive
    "socketActorId",
    "socketEnvUpdateId",
    "willImport", // boolean, not sensitive
    "revokeInvite",

    // org actions
    "newOwnerId",

    // session actions
    "logged"
  ]

export const

  sanitizeError = R.when(
    R.identity,
    R.pipe(
      R.pick(["stack"]),
      R.evolve({stack: stack => stack.split("\n").slice(1)})
    )
  ),

  sanitizeAction = action => {
    let sanitized = {type: action.type}
    if (action.error === true){
      sanitized.error = true
      sanitized.payload = sanitizeError(action.payload)
    }

    for (let keyOrArrayOrObject of ACTION_WHITELIST){
      let keys, valFnByKey
      if (typeof keyOrArrayOrObject == 'string'){
        keys = [keyOrArrayOrObject]
      } else if ( Array.isArray(keyOrArrayOrObject) ){
        const [actionTypes, actionKeys] = keyOrArrayOrObject
        keys = actionTypes.includes(action.type) ? actionKeys : []
      } else {
        keys = Object.keys(keyOrArrayOrObject)
        valFnByKey = keyOrArrayOrObject
      }

      if (!action.error){
        for (let k of keys){
          for (let sanitizedKey of ["payload", "meta"]){
            if (action[sanitizedKey] && action[sanitizedKey][k] !== undefined){
              if (!sanitized[sanitizedKey]){
                sanitized[sanitizedKey] = {}
              }
              sanitized[sanitizedKey][k] = valFnByKey && valFnByKey[k] && action[sanitizedKey][k] ?
                valFnByKey[k](action[sanitizedKey][k]) :
                action[sanitizedKey][k]
            }
          }
        }
      }
    }

    return sanitized
  },

  sanitizeState = state => {
    const sanitized = {}
    for (let keyOrArrayOrObject of STATE_WHITELIST){
      let keys, valFnByKey
      if (typeof keyOrArrayOrObject == 'string'){
        keys = [keyOrArrayOrObject]
      } else {
        keys = Object.keys(keyOrArrayOrObject)
        valFnByKey = keyOrArrayOrObject
      }

      for (let k of keys){
        if (state[k] !== undefined){
          sanitized[k] = valFnByKey && valFnByKey[k] && state[k] ?
            valFnByKey[k](state[k]) :
            state[k]
        }
      }
    }

    return sanitized
  }