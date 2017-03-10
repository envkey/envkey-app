import { createAction } from 'redux-actions'
import R from 'ramda'
import {decamelize} from 'xcase'
import {
  ADD_ASSOC_REQUEST,
  CREATE_ASSOC_REQUEST,
  REMOVE_ASSOC_REQUEST,
  GENERATE_ASSOC_KEY,
  GENERATE_ASSOC_KEY_REQUEST
} from './action_types'

const
  keyRequestEnv = ({appId, assocType, assocId, encryptedRawEnv})=>{
    switch (assocType){
      case "server":
        return {
          "servers": {
            [assocId]: {env: encryptedRawEnv}
          }
        }
      case "user":
        return {
          users: {
            [assocId]: {
              apps: { [appId]: {env: encryptedRawEnv} }
            }
          }
        }
    }
  },

  pickMeta = R.pick([
    "parent",
    "parentType",
    "assocType",
    "parentId",
    "assocId",
    "targetId",
    "isManyToMany",
    "role",
    "passphrase"
  ])

export const
  addAssoc = createAction(
    ADD_ASSOC_REQUEST,
    ({parentType, assocType, assocId, role, name})=> {
      const k = assocType == "server" ? "server" : [parentType, assocType].join("_"),
            obj =  {role, name, [`${assocType}Id`]: assocId}
      return {[k]: obj}
    },
    pickMeta
  ),

  createAssoc = createAction(
    CREATE_ASSOC_REQUEST,
    ({assocType, params})=> ({[decamelize(assocType)]: params}),
    pickMeta
  ),

  removeAssoc = createAction(REMOVE_ASSOC_REQUEST, R.always({}), pickMeta),

  generateKey = createAction(GENERATE_ASSOC_KEY, R.always({}), pickMeta),

  generateKeyRequest = createAction(
    GENERATE_ASSOC_KEY_REQUEST,
    ({encryptedPrivkey, pubkey, encryptedRawEnv, assocId, assocType, parentId})=> {
      return {
        [assocType]: {encryptedPrivkey, pubkey},
        envs: keyRequestEnv({appId: parentId, assocType, assocId, encryptedRawEnv})
      }
    },
    pickMeta
  )