import { createAction } from 'redux-actions'
import R from 'ramda'
import {decamelize} from 'xcase'
import {
  ADD_ASSOC_REQUEST,
  CREATE_ASSOC_REQUEST,
  REMOVE_ASSOC_REQUEST,
  GENERATE_ASSOC_KEY,
  GENERATE_ASSOC_KEY_REQUEST,
  REVOKE_ASSOC_KEY_REQUEST,
  CLEAR_GENERATED_ASSOC_KEY
} from './action_types'

const
  pickMeta = R.pick([
    "parent",
    "parentType",
    "assocType",
    "joinType",
    "parentId",
    "assocId",
    "targetId",
    "isManyToMany",
    "role",
    "passphrase",
    "createOnly",
    "subEnvId",
    "skipKeygen"
  ])

export const
  addAssoc = createAction(
    ADD_ASSOC_REQUEST,
    ({joinType, assocType, assocId, role, name, subEnvId, undeletable})=> {
      const k = joinType || assocType,
            obj =  {role, name, subEnvId, undeletable, [`${assocType}Id`]: assocId}
      return {[k]: obj}
    },
    pickMeta
  ),

  createAssoc = createAction(
    CREATE_ASSOC_REQUEST,
    ({assocType, parentId, parentType, params})=> ({
      [decamelize(assocType)]: params
    }),
    pickMeta
  ),

  removeAssoc = createAction(REMOVE_ASSOC_REQUEST, R.always({}), pickMeta),

  generateKey = createAction(GENERATE_ASSOC_KEY, R.always({}), pickMeta),

  generateKeyRequest = createAction(
    GENERATE_ASSOC_KEY_REQUEST,
    ({encryptedPrivkey,
      signedTrustedPubkeys,
      signedByTrustedPubkeys,
      pubkey,
      pubkeyFingerprint,
      encryptedRawEnv,
      assocType})=> {

      return {
        [assocType]: {encryptedPrivkey, pubkey, pubkeyFingerprint},
        signedTrustedPubkeys,
        signedByTrustedPubkeys,
        env: encryptedRawEnv,
      }
    },
    pickMeta
  ),

  revokeKey = createAction(REVOKE_ASSOC_KEY_REQUEST, R.always({}), pickMeta),

  clearGeneratedAssocKey = createAction(CLEAR_GENERATED_ASSOC_KEY)