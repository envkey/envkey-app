import db from 'lib/db'
import R from 'ramda'
import { getEnvParents } from './object_selectors'

export const
  getIsGeneratingUserKey = db.path("isGeneratingUserKey"),

  getEncryptedPrivkey = db.path("encryptedPrivkey"),

  getPrivkey = db.path("privkey"),

  getIsDecryptingPrivkey = db.path("isDecryptingPrivkey"),

  getIsDecryptingAll = db.path("isDecryptingAll"),

  getDecryptedAll = db.path("decryptedAll"),

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
