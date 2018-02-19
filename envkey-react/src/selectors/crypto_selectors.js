import db from 'lib/db'
import R from 'ramda'
import { getApps, getUser } from './object_selectors'
import { getCurrentUser } from './auth_selectors'

db.init("accountPrivkeys")

export const
  getIsGeneratingUserKey = db.path("isGeneratingUserKey"),

  getEncryptedPrivkey = db.path("encryptedPrivkey"),

  getPrivkey = db.path("privkey"),

  getAccountPrivkeysById = db.accountPrivkeys.index(),

  getDecryptPrivkeyErr = db.path("decryptPrivkeyErr"),

  getDecryptAllErr = db.path("decryptAllErr"),

  getIsDecryptingPrivkey = db.path("isDecryptingPrivkey"),

  getIsDecryptingAllForeground = db.path("isDecryptingAllForeground"),

  getIsDecryptingAllBackground = db.path("isDecryptingAllBackground"),

  getIsDecryptingAll = R.anyPass([getIsDecryptingAllForeground, getIsDecryptingAllBackground]),

  getIsDecrypting = R.anyPass([getIsDecryptingPrivkey, getIsDecryptingAllForeground]),

  getDecryptedAll = db.path("decryptedAll"),

  getSignedTrustedPubkeys = db.path("signedTrustedPubkeys"),

  getTrustedPubkeys = db.path("trustedPubkeys"),

  getGeneratedEnvKeysById = db.path("generatedEnvKeys"),

  getIsUpdatingEncryptedPrivkey = db.path("isUpdatingEncryptedPrivkey"),

  getUpdateEncryptedPrivkeyErr = db.path("updateEncryptedPrivkeyErr"),

  getEnvsAreDecrypting = (id, state) => {
    if(!state)return R.partial(getEnvsAreDecrypting, [id])
    return getIsDecryptingPrivkey(state) ||
          db.path("envsAreDecrypting", id)(state) ||
          false
  },

  getEnvsAreDecrypted = (id, state) => {
    if(!state)return R.partial(getEnvsAreDecrypted, [id])
    return db.path("envsAreDecrypted", id)(state) || false
  },

  getAllEnvParentsAreDecrypted = state => {
    return R.pipe(
      getApps,
      R.all(({id})=> getEnvsAreDecrypted(id, state))
    )(state)
  },

  // Gets list of trusted pubkeys back to the org owner
  getTrustedPubkeyChain = state => {
    const currentUser = getCurrentUser(state),
          trustedPubkeys = getTrustedPubkeys(state),
          trustChain = {},
          checked = {}

    let currentId = currentUser.id

    while (true){
      if (checked[currentId])throw new Error("Trusted pubkey chain couldn't find org creator root.")
      checked[currentId] = true

      let trusted = trustedPubkeys[currentId]
      if (!trusted)throw new Error("Trusted pubkey chain broken.")

      let trustedInviter = getUser(currentId, state)
      if (!trustedInviter)throw new Error("Trusted user not found. Chain broken.")

      trustChain[currentId] = R.pick(["invitePubkey", "pubkey", "invitedById"], trustedInviter)

      if (trustedInviter.invitedById){
        // Continue checking chain of invites
        currentId = trustedInviter.invitedById
      } else if (trustedInviter.isOrgCreator) {
        // Found org creator, return chain
        return trustChain
      }
    }
  }
