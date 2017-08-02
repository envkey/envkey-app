import db from 'lib/db'
import R from 'ramda'
import { getEnvParents } from './object_selectors'
// import {} from 'lib/crypto'

export const
  getIsGeneratingUserKey = db.path("isGeneratingUserKey"),

  getEncryptedPrivkey = db.path("encryptedPrivkey"),

  getPrivkey = db.path("privkey"),

  getIsDecryptingPrivkey = db.path("isDecryptingPrivkey"),

  getIsDecryptingAll = db.path("isDecryptingAll"),

  getDecryptedAll = db.path("decryptedAll"),

  getSignedTrustedPubkeys = db.path("signedTrustedPubkeys"),

  getTrustedPubkeys = db.path("trustedPubkeys"),

  getGeneratedEnvkeysById = db.path("generatedEnvkeys"),

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
      getEnvParents,
      R.all(({id})=> getEnvsAreDecrypted(id, state))
    )(state)
  }
