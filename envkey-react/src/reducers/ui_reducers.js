import {isClearSessionAction} from './helpers'
import R from 'ramda'
import {
  ADD_ASSOC_REQUEST,
  ADD_ASSOC_FAILED,
  ADD_ASSOC_SUCCESS,

  REMOVE_ASSOC_REQUEST,
  REMOVE_ASSOC_FAILED,
  REMOVE_ASSOC_SUCCESS,

  GENERATE_ASSOC_KEY,
  GENERATE_ASSOC_KEY_REQUEST,
  GENERATE_ASSOC_KEY_FAILED,
  GENERATE_ASSOC_KEY_SUCCESS,

  REVOKE_ASSOC_KEY_REQUEST,
  REVOKE_ASSOC_KEY_FAILED,
  REVOKE_ASSOC_KEY_SUCCESS,

  CREATE_ASSOC_REQUEST,
  CREATE_ASSOC_FAILED,
  CREATE_ASSOC_SUCCESS,

  CREATE_OBJECT_REQUEST,
  CREATE_OBJECT_SUCCESS,
  CREATE_OBJECT_FAILED,

  UPDATE_OBJECT_SETTINGS_REQUEST,
  UPDATE_OBJECT_SETTINGS_SUCCESS,
  UPDATE_OBJECT_SETTINGS_FAILED,

  RENAME_OBJECT_REQUEST,
  RENAME_OBJECT_SUCCESS,
  RENAME_OBJECT_FAILED,

  REMOVE_OBJECT_REQUEST,
  REMOVE_OBJECT_SUCCESS,
  REMOVE_OBJECT_FAILED,

  UPDATE_ORG_ROLE,
  UPDATE_ORG_ROLE_FAILED,
  UPDATE_ORG_ROLE_SUCCESS,

  IMPORT_SINGLE_ENVIRONMENT,
  IMPORT_SINGLE_ENVIRONMENT_SUCCESS,
  IMPORT_SINGLE_ENVIRONMENT_FAILED,

  IMPORT_ALL_ENVIRONMENTS,
  IMPORT_ALL_ENVIRONMENTS_SUCCESS,
  IMPORT_ALL_ENVIRONMENTS_FAILED
} from "actions"
import {isOutdatedEnvsResponse} from 'lib/actions'

export const
  isCreating = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case CREATE_OBJECT_REQUEST:
        if(action.meta.createAssoc)return state
        return R.assoc(action.meta.objectType, true, state)

      case CREATE_OBJECT_SUCCESS:
      case CREATE_OBJECT_FAILED:
        if(action.meta.createAssoc)return state
        return R.dissoc(action.meta.objectType, state)

      case CREATE_ASSOC_REQUEST:
        if(action.meta.parentId && action.meta.assocType){
          return R.assocPath([action.meta.parentId, action.meta.assocType, (action.meta.role || "all")], true, state)
        } else if (action.meta.objectType){
          return R.assoc(action.meta.objectType, true, state)
        }

      case CREATE_ASSOC_SUCCESS:
      case CREATE_ASSOC_FAILED:
        if(action.meta.parentId && action.meta.assocType){
          return R.dissocPath([action.meta.parentId, action.meta.assocType, (action.meta.role || "all")], state)
        } else if (action.meta.objectType){
          return R.dissoc(action.meta.objectType, state)
        }

      default:
        return state
    }
  },

  isAddingAssoc = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case ADD_ASSOC_REQUEST:
      case CREATE_ASSOC_REQUEST:
        if(action.meta.createAssoc)return state
        return R.pipe(
          R.assocPath([action.meta.parentId,
                       action.meta.assocType,
                       (action.meta.role || "all"),
                       (action.meta.assocId || "create")],
                       true),
          R.when(()=> action.meta.assocId,
                 R.assocPath([action.meta.assocId,
                             action.meta.parentType,
                             (action.meta.role || "all"),
                             (action.meta.parentId || "create")],
                             true))
        )(state)

      case ADD_ASSOC_SUCCESS:
      case ADD_ASSOC_FAILED:
      case CREATE_ASSOC_SUCCESS:
      case CREATE_ASSOC_FAILED:
        if(action.meta.createAssoc)return state
        return R.pipe(
          R.dissocPath([action.meta.parentId,
                       action.meta.assocType,
                       (action.meta.role || "all"),
                       (action.meta.assocId || "create")]),
          R.when(()=> action.meta.assocId,
                 R.dissocPath([action.meta.assocId,
                             action.meta.parentType,
                             (action.meta.role || "all"),
                             (action.meta.parentId || "create")]))
        )(state)

      default:
        return state
    }
  },

  isRemoving = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case REMOVE_ASSOC_REQUEST:
      case REMOVE_OBJECT_REQUEST:
        return R.assoc(action.meta.targetId, true, state)

      case REMOVE_ASSOC_SUCCESS:
      case REMOVE_ASSOC_FAILED:
      case REMOVE_OBJECT_SUCCESS:
      case REMOVE_OBJECT_FAILED:
        return R.dissoc(action.meta.targetId, state)

      default:
        return state
    }
  },

  isGeneratingAssocKey = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case GENERATE_ASSOC_KEY:
        return R.assoc(action.meta.targetId, true, state)

      case GENERATE_ASSOC_KEY_SUCCESS:
      case GENERATE_ASSOC_KEY_FAILED:
        return R.dissoc(action.meta.targetId, state)

      default:
        return state
    }
  },

  isRevokingAssocKey = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case REVOKE_ASSOC_KEY_REQUEST:
        return R.assoc(action.meta.targetId, true, state)

      case REVOKE_ASSOC_KEY_SUCCESS:
      case REVOKE_ASSOC_KEY_FAILED:
        return R.dissoc(action.meta.targetId, state)

      default:
        return state
    }
  },

  isUpdatingSettings = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case UPDATE_OBJECT_SETTINGS_REQUEST:
        return R.assoc(action.meta.targetId, true, state)

      case UPDATE_OBJECT_SETTINGS_SUCCESS:
      case UPDATE_OBJECT_SETTINGS_FAILED:
        return R.dissoc(action.meta.targetId, state)

      default:
        return state
    }
  },

  isUpdatingOrgRole = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case UPDATE_ORG_ROLE:
        return R.assoc(action.payload.userId, true, state)

      case UPDATE_ORG_ROLE_SUCCESS:
      case UPDATE_ORG_ROLE_FAILED:
        return R.dissoc(action.meta.userId, state)

      default:
        return state
    }
  },

  isImportingConfig = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case IMPORT_SINGLE_ENVIRONMENT:
        return R.assocPath([action.meta.parentId, action.payload.environment], true, state)

      case IMPORT_SINGLE_ENVIRONMENT_SUCCESS:
      case IMPORT_SINGLE_ENVIRONMENT_FAILED:
        return R.pipe(
          R.dissocPath([action.meta.parentId, action.meta.environment]),
          R.reject(R.isEmpty)
        )(state)

      case IMPORT_ALL_ENVIRONMENTS:
        return R.assocPath([action.meta.parentId, "all"], true, state)

      case IMPORT_ALL_ENVIRONMENTS_SUCCESS:
      case IMPORT_ALL_ENVIRONMENTS_FAILED:
        return R.dissoc(action.meta.parentId, state)

      default:
        return state
    }
  },

  isRenaming = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case RENAME_OBJECT_REQUEST:
        return R.assoc(action.meta.targetId, true, state)

      case RENAME_OBJECT_SUCCESS:
      case RENAME_OBJECT_FAILED:
        return R.dissoc(action.meta.targetId, state)

      default:
        return state
    }
  }




