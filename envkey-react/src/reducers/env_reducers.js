import R from 'ramda'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,

  UPDATE_ENV_SUCCESS,
  UPDATE_ENV_FAILED,

  ADD_ASSOC_REQUEST,
  ADD_ASSOC_SUCCESS,
  ADD_ASSOC_FAILED,

  REMOVE_ASSOC_REQUEST,
  REMOVE_ASSOC_SUCCESS,
  REMOVE_ASSOC_FAILED,

  REMOVE_OBJECT_REQUEST,
  REMOVE_OBJECT_SUCCESS,
  REMOVE_OBJECT_FAILED
} from "actions"
import {
  rawEnv,
  createEntry,
  updateEntry,
  removeEntry,
  updateEntryVal
} from 'lib/env/transform'

const
  transformEnv = ({type, envsWithMeta, payload})=> {
    const updateEnvFn = {
            [CREATE_ENTRY]: createEntry,
            [UPDATE_ENTRY]: updateEntry,
            [REMOVE_ENTRY]: removeEntry,
            [UPDATE_ENTRY_VAL]: updateEntryVal
          }[type]

    return  updateEnvFn({envsWithMeta, ...payload})
  },

  transformEnvReducer = (state = {}, action)=>{
    const {type, meta, payload} = action,
          {parent, parentId} = meta,
          envsWithMeta = R.path([parentId, "envsWithMeta"], state) || parent.envsWithMeta || {}

    return R.assocPath(
      [parentId, "envsWithMeta"],
      transformEnv({type, envsWithMeta, payload}),
      state
    )
  },

  updateEnvSuccessReducer = (state = {}, action)=>{
    return R.dissocPath([action.meta.parentId, "envsWithMeta"], state)
  },

  addOrRemoveAssocRequestReducer = (state = {}, action)=>{
    const {parentType, parentId, assocType, assocId} = action.meta
    if (!(parentType == "app" && assocType == "service"))return state

    const appendKey = {[ADD_ASSOC_REQUEST]: "addServiceIds", [REMOVE_ASSOC_REQUEST]: "removeServiceIds"}[action.type],
          appendPath = [parentId, appendKey],
          appendToArr = R.path(appendPath, state) || [],
          appended = R.append(assocId, appendToArr),

          removeKey = {[ADD_ASSOC_REQUEST]: "removeServiceIds", [REMOVE_ASSOC_REQUEST]: "addServiceIds"}[action.type],
          removePath = [parentId, removeKey],
          removeFromArr = R.path(removePath, state) || [],
          removed = R.without([assocId], removeFromArr)

    return R.pipe(
      R.assocPath(appendPath, appended),
      R.assocPath(removePath, removed)
    )(state)
  },

  addOrRemoveAssocSuccessReducer = (state = {}, action)=>{
    const {parentType, parentId, assocType, assocId} = action.meta
    if (!(parentType == "app" && assocType == "service"))return state
    const k = {[ADD_ASSOC_SUCCESS]: "addServiceIds", [REMOVE_ASSOC_SUCCESS]: "removeServiceIds"}[action.type],
          path = [parentId, k],
          addOrRemoveArr = R.path(path, state)

    return R.assocPath(path, R.without([assocId], addOrRemoveArr), state)
  },

  removeObjectRequestReducer = (state = {}, action)=>{
    const {objectType, targetId} = action.meta
    if (objectType != "service")return state

    const removeServiceIds = R.append(targetId, (state.removeServiceIds || []))
    return R.assoc("removeServiceIds", removeServiceIds, state)
  },

  removeObjectSuccessReducer = (state = {}, action)=>{
    const {objectType, targetId} = action.meta
    if (objectType != "service")return state

    const removeServiceIds = R.without([targetId], (state.removeServiceIds || []))
    return R.assoc("removeServiceIds", removeServiceIds, state)
  }

export const

  envsPending = (state = {}, action)=> {
    switch(action.type){

      case CREATE_ENTRY:
      case UPDATE_ENTRY:
      case REMOVE_ENTRY:
      case UPDATE_ENTRY_VAL:
        return transformEnvReducer(state, action)

      case UPDATE_ENV_SUCCESS:
        return updateEnvSuccessReducer(state, action)

      case ADD_ASSOC_REQUEST:
      case REMOVE_ASSOC_REQUEST:
        return addOrRemoveAssocRequestReducer(state, action)

      case ADD_ASSOC_SUCCESS:
      case REMOVE_ASSOC_SUCCESS:
        return addOrRemoveAssocSuccessReducer(state, action)

      case REMOVE_OBJECT_REQUEST:
        return removeObjectRequestReducer(state, action)

      case REMOVE_OBJECT_SUCCESS:
        return removeObjectSuccessReducer(state, action)

      default:
        return state
    }
  }