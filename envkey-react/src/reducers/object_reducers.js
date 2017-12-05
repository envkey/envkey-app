import {isClearSessionAction, isFetchCurrentUserAction} from './helpers'
import R from 'ramda'
import { ORG_OBJECT_TYPES_PLURALIZED } from 'constants'
import pluralize from 'pluralize'
import {camelize} from 'xcase'
import {
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_UPDATES_API_SUCCESS,
  DECRYPT_ENVS_SUCCESS,
  UPDATE_ENV_SUCCESS,
  REMOVE_ASSOC_SUCCESS,
  ADD_ASSOC_SUCCESS,
  CREATE_OBJECT_SUCCESS,
  UPDATE_OBJECT_SETTINGS_SUCCESS,
  RENAME_OBJECT_SUCCESS,
  REMOVE_OBJECT_SUCCESS,
  FETCH_OBJECT_DETAILS_API_SUCCESS,
  FETCH_OBJECT_DETAILS_SUCCESS,
  GENERATE_ASSOC_KEY_SUCCESS,
  REVOKE_ASSOC_KEY_SUCCESS,
  GRANT_ENV_ACCESS_SUCCESS,
  UPDATE_ORG_ROLE_SUCCESS,
  SELECTED_OBJECT
} from 'actions'
import { indexById } from './helpers'

const
  getFetchCurrentUserReducer = objectTypePlural => (state, {
    payload
  })=>{
    const objects = payload[objectTypePlural]
    return objects ? indexById(objects) : state
  },

  getFetchCurrentUserUpdatesReducer = objectTypePlural => (state, action)=>{
    let objects = action.payload[objectTypePlural]

    // For apps being overwritten, don't overwrite encryptedEnvsWithMeta -- env update logic takes care of this
    if (objectTypePlural == "apps"){
      objects = R.map(newApp => {
        let stateApp = state[newApp.id]
        if (stateApp){
          return R.pipe(
            R.omit(["encryptedEnvsWithMeta"]),
            R.assoc("envsWithMeta", stateApp.envsWithMeta)
          )(newApp)
        } else {
          return newApp
        }
      }, objects)
    }

    if (action.meta && action.meta.noMinUpdatedAt){
      return objects ? indexById(objects) : state
    } else {
      return objects && objects.length ? {...state, ...indexById(objects)} : state
    }
  },

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
    } else if (objectTypePlural == "apps" && parentType == "app" && payload.keyablesUpdatedAt){
      return R.assocPath([payload.appId, "keyablesUpdatedAt"], payload.keyablesUpdatedAt, state)
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

  getRemoveObjectReducer = objectTypePlural => (state, {payload, meta})=>{
    if (meta.objectType == "orgUser"){
      const objects = payload[objectTypePlural]
      return objects ? indexById(objects) : state
    } else {
      const ids = payload[objectTypePlural]
      if(ids){
        return R.pick(ids, state)
      }
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
    meta: {assocType}, payload
  })=> {
    if(pluralize(assocType) == objectTypePlural){
      const {id} = payload
      return R.assoc(id, R.omit(["keyablesUpdatedAt"], payload), state)
    } else if (objectTypePlural == "apps"){
      return R.assocPath([payload.appId, "keyablesUpdatedAt"], payload.keyablesUpdatedAt, state)
    }
    return state
  },

  getRevokeKeyReducer = objectTypePlural => (state, {
    meta: {assocType}, payload
  })=> {
    if(pluralize(assocType) == objectTypePlural){
      const {id} = payload
      return R.assoc(id, payload, state)
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

  getFetchObjectAssociationsReducer = objectTypePlural => (state, {
    meta: {objectType}, payload
  })=> {
    if(pluralize(objectType) != objectTypePlural){
      const associations = payload[objectTypePlural]

      if (associations && associations.length){
        return associations.reduce((acc, assoc)=>{
          return {...acc, [assoc.id]: assoc}
        }, state)
      }
    }
    return state
  },

  objectReducers = {}

ORG_OBJECT_TYPES_PLURALIZED.forEach(objectTypePlural => {
  objectReducers[objectTypePlural] = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    if (action.type == FETCH_CURRENT_USER_UPDATES_API_SUCCESS){
      return getFetchCurrentUserUpdatesReducer(objectTypePlural)(state, action)
    } else if (isFetchCurrentUserAction(action)){
      return getFetchCurrentUserReducer(objectTypePlural)(state, action)
    }

    switch(action.type){
      case GRANT_ENV_ACCESS_SUCCESS:
      case UPDATE_ORG_ROLE_SUCCESS:
        return getFetchCurrentUserReducer(objectTypePlural)(state, action)

      case FETCH_CURRENT_USER_UPDATES_API_SUCCESS:
        return getFetchCurrentUserUpdatesReducer(objectTypePlural)(state, action)

      case DECRYPT_ENVS_SUCCESS:
        return getDecryptEnvsReducer(objectTypePlural)(state, action)

      case FETCH_OBJECT_DETAILS_SUCCESS:
        return getFetchObjectReducer(objectTypePlural)(state, action)

      case FETCH_OBJECT_DETAILS_API_SUCCESS:
        return getFetchObjectAssociationsReducer(objectTypePlural)(state, action)

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

      case REVOKE_ASSOC_KEY_SUCCESS:
        return getRevokeKeyReducer(objectTypePlural)(state, action)

      default:
        return state
    }
  }
})

objectReducers.selectedObjectType = (state=null, action)=>{
  if (isClearSessionAction(action)){
    return null
  }

  switch(action.type){
    case SELECTED_OBJECT:
      return action.payload.objectType || null

    default:
      return state
  }
}

objectReducers.selectedObjectId = (state=null, action)=>{
  if (isClearSessionAction(action)){
    return null
  }

  switch(action.type){
    case SELECTED_OBJECT:
      return action.payload.id || null

    default:
      return state
  }
}

objectReducers.onboardAppId = (state=null, action)=>{
  if (isClearSessionAction(action)){
    return null
  }

  switch(action.type){
    case CREATE_OBJECT_SUCCESS:
    case REMOVE_OBJECT_SUCCESS:
      if (action.type == CREATE_OBJECT_SUCCESS &&
          action.meta.objectType == "app" &&
          action.meta.isOnboardAction){
        return action.payload.id
      } else if (action.type == REMOVE_OBJECT_SUCCESS &&
                 action.meta.objectType == "app" &&
                 action.meta.isOnboardAction){
        return null
      } else {
        return state
      }

    default:
      return state
  }
}

export default objectReducers
