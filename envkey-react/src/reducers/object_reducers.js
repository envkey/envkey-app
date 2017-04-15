import R from 'ramda'
import { ORG_OBJECT_TYPES_PLURALIZED } from 'constants'
import pluralize from 'pluralize'
import {camelize} from 'xcase'
import {
  FETCH_CURRENT_USER_SUCCESS,
  DECRYPT_ENVS_SUCCESS,
  LOGIN,
  REGISTER,
  REGISTER_SUCCESS,
  SELECT_ORG,
  LOGOUT,
  UPDATE_ENV_SUCCESS,
  REMOVE_ASSOC_SUCCESS,
  ADD_ASSOC_SUCCESS,
  CREATE_OBJECT_SUCCESS,
  UPDATE_OBJECT_SETTINGS_SUCCESS,
  RENAME_OBJECT_SUCCESS,
  REMOVE_OBJECT_SUCCESS,
  FETCH_OBJECT_DETAILS_SUCCESS,
  GENERATE_ASSOC_KEY_SUCCESS,
  CHECK_INVITES_ACCEPTED_SUCCESS,
  GRANT_ENV_ACCESS_SUCCESS,
  UPDATE_ORG_ROLE_SUCCESS,
  SELECTED_OBJECT
} from 'actions'
import { indexById } from './helpers'

const
  getUpdateEnvReducer = objectTypePlural => (state, {
    payload: {envsUpdatedAt},
    meta: {parentType, parentId, updatedEnvsWithMeta}
  })=> {
    if(pluralize(parentType) == objectTypePlural){
      return R.pipe(
        R.assocPath([parentId, "envsWithMeta"], updatedEnvsWithMeta),
        R.assocPath([parentId, "envsUpdatedAt"], envsUpdatedAt)
      )(state)
    }
    return state
  },

  getRemoveAssocReducer = objectTypePlural => (state, {
    meta: {parentType, assocType, targetId, isManyToMany}
  })=> {
    const type = isManyToMany ? pluralize(camelize([parentType, assocType].join("_"))) :
                                pluralize(assocType)
    if(type == objectTypePlural){
      return R.dissoc(targetId, state)
    }
    return state
  },

  getAddAssocReducer = objectTypePlural => (state, {
    meta: {parentType, assocType, isManyToMany},
    payload
  })=> {
    const type = isManyToMany ? pluralize(camelize([parentType, assocType].join("_"))) :
                                pluralize(assocType)
    if(type == objectTypePlural){
      return R.assoc(payload.id, payload, state)
    }
    return state
  },

  getCreateObjectReducer = objectTypePlural => (state, {
    meta: {objectType}, payload
  })=> {
    if(pluralize(objectType) == objectTypePlural){
      return R.assoc(payload.id, payload, state)
    } else {
      const associations = payload[objectTypePlural]

      if (associations && associations.length){
        return associations.reduce((acc, assoc)=>{
          return {...acc, [assoc.id]: assoc}
        }, state)
      }
    }
    return state
  },

  getRemoveObjectReducer = objectTypePlural => (state, {payload})=>{
    const ids = payload[objectTypePlural]
    if(ids){
      return R.pick(ids, state)
    }
    return state
  },

  getUpdateObjectReducer = objectTypePlural => (state, {
    meta: {objectType}, payload
  })=> {
    if(pluralize(objectType) == objectTypePlural){
      return R.assoc(payload.id, payload, state)
    }
    return state
  },

  getGenerateKeyReducer = objectTypePlural => (state, {
    meta: {assocType, passphrase}, payload
  })=> {
    if(pluralize(assocType) == objectTypePlural){
      const {id} = payload,
            withPassphrase = R.assoc("passphrase", passphrase, payload)
      return R.assoc(id, withPassphrase, state)
    }
    return state
  },

  getCheckInvitesAcceptedReducer = objectTypePlural => (state, {
    payload: {inviteesNeedingAccess}
  })=> {
    if(objectTypePlural == "users"){
      if (inviteesNeedingAccess && inviteesNeedingAccess.length > 0){
        return inviteesNeedingAccess.reduce((acc, {userId, pubkey}) => {
          return R.assocPath([userId, "pubkey"], pubkey, acc)
        }, state)
      }
    }

    return state
  },

  getDecryptEnvsReducer = objectTypePlural => (state, {
    meta: {objectType}, payload
  })=>{
    if (pluralize(objectType) == objectTypePlural){
      return R.assoc(payload.id, payload, state)
    }

    return state
  },

  getFetchObjectReducer = objectTypePlural => (state, {
    meta: {objectType}, payload
  })=>{

    if (pluralize(objectType) == objectTypePlural){
      return R.assoc(payload.id, payload, state)
    }

    return state
  },

  objectReducers = {}

ORG_OBJECT_TYPES_PLURALIZED.forEach(objectTypePlural => {
  objectReducers[objectTypePlural] = (state = {}, action)=>{
    switch(action.type){
      case FETCH_CURRENT_USER_SUCCESS:
      case REGISTER_SUCCESS:
      case GRANT_ENV_ACCESS_SUCCESS:
      case UPDATE_ORG_ROLE_SUCCESS:
        let objects = action.payload[objectTypePlural]
        return objects ? indexById(objects) : state

      case DECRYPT_ENVS_SUCCESS:
        return getDecryptEnvsReducer(objectTypePlural)(state, action)

      case FETCH_OBJECT_DETAILS_SUCCESS:
        return getFetchObjectReducer(objectTypePlural)(state, action)

      case UPDATE_ENV_SUCCESS:
        return getUpdateEnvReducer(objectTypePlural)(state, action)

      case REMOVE_ASSOC_SUCCESS:
        return getRemoveAssocReducer(objectTypePlural)(state, action)

      case ADD_ASSOC_SUCCESS:
        return getAddAssocReducer(objectTypePlural)(state, action)

      case CREATE_OBJECT_SUCCESS:
        return getCreateObjectReducer(objectTypePlural)(state, action)

      case REMOVE_OBJECT_SUCCESS:
        return getRemoveObjectReducer(objectTypePlural)(state, action)

      case UPDATE_OBJECT_SETTINGS_SUCCESS:
      case RENAME_OBJECT_SUCCESS:
        return getUpdateObjectReducer(objectTypePlural)(state, action)

      case GENERATE_ASSOC_KEY_SUCCESS:
        return getGenerateKeyReducer(objectTypePlural)(state, action)

      case CHECK_INVITES_ACCEPTED_SUCCESS:
        return getCheckInvitesAcceptedReducer(objectTypePlural)(state, action)

      case LOGIN:
      case REGISTER:
      case LOGOUT:
      case SELECT_ORG:
        return {}

      default:
        return state
    }
  }
})

objectReducers.selectedObjectType = (state=null, action)=>{
  switch(action.type){
    case SELECTED_OBJECT:
      return action.payload.objectType

    default:
      return state
  }
}

objectReducers.selectedObjectId = (state=null, action)=>{
  switch(action.type){
    case SELECTED_OBJECT:
      return action.payload.id

    default:
      return state
  }
}


export default objectReducers






