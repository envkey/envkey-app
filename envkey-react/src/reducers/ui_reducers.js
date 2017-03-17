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

  CREATE_ASSOC_REQUEST,
  CREATE_ASSOC_FAILED,
  CREATE_ASSOC_SUCCESS,

  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,

  UPDATE_ENV_REQUEST,
  UPDATE_ENV_FAILED,
  UPDATE_ENV_SUCCESS,

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
  REMOVE_OBJECT_FAILED
} from "actions"

export const isCreating = (state = {}, action)=>{
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
}

export const isAddingAssoc = (state = {}, action)=>{
  switch(action.type){
    case ADD_ASSOC_REQUEST:
    case CREATE_ASSOC_REQUEST:
      return R.assocPath([action.meta.parentId,
                          action.meta.assocType,
                          (action.meta.role || "all"),
                          action.meta.assocId],
                         true,
                         state)

    case ADD_ASSOC_SUCCESS:
    case ADD_ASSOC_FAILED:
    case CREATE_ASSOC_FAILED:
      return R.dissocPath([action.meta.parentId,
                           action.meta.assocType,
                           (action.meta.role || "all"),
                           action.meta.assocId],
                          state)

    default:
      return state
  }
}

export const isRemoving = (state = {}, action)=>{
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
}

export const isGeneratingAssocKey = (state = {}, action)=>{
  switch(action.type){
    case GENERATE_ASSOC_KEY:
      return R.assoc(action.meta.targetId, true, state)

    case GENERATE_ASSOC_KEY_SUCCESS:
    case GENERATE_ASSOC_KEY_FAILED:
      return R.dissoc(action.meta.targetId, state)

    default:
      return state
  }
}

export const isUpdatingSettings = (state = {}, action)=>{
  switch(action.type){
    case UPDATE_OBJECT_SETTINGS_REQUEST:
      return R.assoc(action.meta.targetId, true, state)

    case UPDATE_OBJECT_SETTINGS_SUCCESS:
    case UPDATE_OBJECT_SETTINGS_FAILED:
      return R.dissoc(action.meta.targetId, state)

    default:
      return state
  }
}

export const isUpdatingEnv = (state = {}, action)=>{
  switch(action.type){
    case UPDATE_ENTRY_VAL:
      return R.assocPath([action.meta.parentId, action.payload.entryKey, action.payload.environment], true, state)

    case UPDATE_ENTRY:
      return R.assocPath([action.meta.parentId, action.payload.entryKey, "key"], true, state)

    case REMOVE_ENTRY:
      return R.assocPath([action.meta.parentId, action.payload.entryKey, "key"], true, state)

    case UPDATE_ENV_SUCCESS:
    case UPDATE_ENV_FAILED:
      return R.pipe(
        R.dissocPath([action.meta.parentId, action.meta.transformPayload.entryKey, action.meta.transformPayload.environment]),
        R.dissocPath([action.meta.parentId, action.meta.transformPayload.entryKey, "key"])
      )(state)

    default:
      return state
  }
}

export const isCreatingEnvEntry = (state = {}, action)=>{
  switch(action.type){
    case CREATE_ENTRY:
      return R.assoc(action.meta.parentId, true, state)

    case UPDATE_ENV_SUCCESS:
    case UPDATE_ENV_FAILED:
      return R.dissoc(action.meta.parentId, state)

    default:
      return state
  }
}

export const isRenaming = (state = {}, action)=>{
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

