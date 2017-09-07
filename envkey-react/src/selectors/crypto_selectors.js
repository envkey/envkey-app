import db from 'lib/db'
import R from 'ramda'
import { getApps } from './object_selectors'
import { getCurrentUser } from './auth_selectors'

export const
  getIsGeneratingUserKey = db.path("isGeneratingUserKey"),

  getEncryptedPrivkey = db.path("encryptedPrivkey"),

  getPrivkey = db.path("privkey"),

  getIsDecryptingPrivkey = db.path("isDecryptingPrivkey"),

  getIsDecryptingAll = db.path("isDecryptingAll"),

  getIsDecrypting = R.anyPass([getIsDecryptingPrivkey, getIsDecryptingAll]),

  getDecryptedAll = db.path("decryptedAll"),

  getSignedTrustedPubkeys = db.path("signedTrustedPubkeys"),

  getTrustedPubkeys = db.path("trustedPubkeys"),

  getGeneratedEnvKeysById = db.path("generatedEnvKeys"),

  getTrustedPubkey = R.curry((keyableId, state)=> db.path("trustedPubkeys", keyableId, "pubkey")(state)),

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
          trustChain = {}

    let currentId = currentUser.id

    while (true){
      let currentPubkeyData = trustedPubkeys[currentId]
      if (!currentPubkeyData)throw new Error("Trusted pubkey chain broken.")
      trustChain[currentId] = currentPubkeyData
      if (currentPubkeyData.invitedById){
        currentId = currentPubkeyData.invitedById
      } else {
        return trustChain
      }
    }
  }
