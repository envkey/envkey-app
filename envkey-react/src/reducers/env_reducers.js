import {isClearSessionAction} from './helpers'
import R from 'ramda'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,

  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
  RENAME_SUB_ENV,

  GENERATE_ENV_UPDATE_ID,
  CLEAR_PENDING_ENV_UPDATE,

  UPDATE_ENV_REQUEST,
  UPDATE_ENV_API_SUCCESS,
  UPDATE_ENV_SUCCESS,
  UPDATE_ENV_FAILED,

  GRANT_ENV_ACCESS,
  GRANT_ENV_ACCESS_FAILED,
  GRANT_ENV_ACCESS_SUCCESS,

  SOCKET_UPDATE_ENVS,

  FETCH_OBJECT_DETAILS_API_SUCCESS,
  FETCH_OBJECT_DETAILS_SUCCESS,
  FETCH_OBJECT_DETAILS_FAILED,

  ADD_ASSOC_REQUEST,
  ADD_ASSOC_SUCCESS,
  ADD_ASSOC_FAILED,

  REMOVE_ASSOC_REQUEST,
  REMOVE_ASSOC_SUCCESS,
  REMOVE_ASSOC_FAILED,

  REMOVE_OBJECT_REQUEST,
  REMOVE_OBJECT_SUCCESS,
  REMOVE_OBJECT_FAILED,

  COMMIT_IMPORT_ACTIONS
} from "actions"
import { isOutdatedEnvsResponse } from 'lib/actions'

const

  envActionsPendingTransformEnvReducer = (state, action)=>{
    if(R.path(["meta", "queued"], action)){
      return state
    }
    const {parentId, envUpdateId} = action.meta,
          path = [parentId, envUpdateId],
          queueAction = {...action, meta: {...action.meta, queued: true}}

    return R.path(path, state) ?
      R.over(R.lensPath(path), R.concat([queueAction]), state) :
      R.assocPath(path, [queueAction], state)
  },

  envActionsPendingCommitImportReducer = (state, action)=>{
    const {parentId, envUpdateId} = action.meta,
          path = [parentId, envUpdateId],
          queueActions = action.payload.map(pendingAction => ({
            ...pendingAction,
            meta: {...pendingAction.meta, importAction: false, queued: true}
          }))

    return R.path(path, state) ?
      R.over(R.lensPath(path), R.concat(queueActions), state) :
      R.assocPath(path, queueActions, state)
  }

export const

  lastAddedEntry = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case CREATE_ENTRY:
      case UPDATE_ENTRY:
        if(action.meta.importAction)return state

        const {meta: {parentId, timestamp}, payload: {entryKey, newKey}} = action,
              res = action.type == UPDATE_ENTRY ? {entryKey: newKey, timestamp} : {entryKey, timestamp}

        return R.assoc(parentId, res)(state)

      default:
        return state
    }
  },

  envActionsPending = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case CREATE_ENTRY:
      case UPDATE_ENTRY:
      case REMOVE_ENTRY:
      case UPDATE_ENTRY_VAL:
      case ADD_SUB_ENV:
      case REMOVE_SUB_ENV:
      case RENAME_SUB_ENV:
        if(action.meta.importAction){
          return state
        } else {
          return envActionsPendingTransformEnvReducer(state, action)
        }

      case COMMIT_IMPORT_ACTIONS:
        return envActionsPendingCommitImportReducer(state, action)

      case UPDATE_ENV_SUCCESS:
      case CLEAR_PENDING_ENV_UPDATE:
        return R.pipe(
          R.dissocPath([action.meta.parentId, action.meta.envUpdateId]),
          R.reject(R.isEmpty)
        )(state)

      default:
        return state
    }
  },

  isRequestingEnvUpdate = (state = {}, action)=>{
    switch(action.type){
      case UPDATE_ENV_REQUEST:
        return R.assoc(action.meta.parentId, true, state)

      case UPDATE_ENV_SUCCESS:
      case UPDATE_ENV_FAILED:
        if (isOutdatedEnvsResponse(action)){
          return state
        } else {
          return R.dissoc(action.meta.parentId, state)
        }

      default:
        return state
    }
  },

  isUpdatingOutdatedEnvs = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case UPDATE_ENV_FAILED:
        if (isOutdatedEnvsResponse(action)){
          return R.assoc(action.meta.parentId, true, state)
        } else {
          return state
        }

      case FETCH_OBJECT_DETAILS_SUCCESS:
      case FETCH_OBJECT_DETAILS_FAILED:
        if (action.meta.isOutdatedEnvsRequest){
          return R.dissoc(action.meta.targetId, state)
        } else {
          return state
        }

      default:
        return state
    }
  },

  isRebasingOutdatedEnvs = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case UPDATE_ENV_FAILED:
        if (isOutdatedEnvsResponse(action)){
          return R.assoc(action.meta.parentId, true, state)
        } else {
          return state
        }

      case UPDATE_ENV_REQUEST:
        if (action.meta.isOutdatedEnvsRequest){
          return R.dissoc(action.meta.parentId, state)
        } else {
          return state
        }

      default:
        return state
    }
  },

  envUpdateId = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    switch(action.type){
      case GENERATE_ENV_UPDATE_ID:
        return R.assoc(action.meta.parentId, action.payload, state)

      case UPDATE_ENV_REQUEST:
        return action.meta.forceEnvUpdateId ?
          state :
          R.assoc(action.meta.parentId, action.meta.nextEnvUpdateId, state)

      default:
        return state
    }
  },

  isUpdatingEnv = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    if(action.meta && action.meta.importAction){
      return state
    }
    switch(action.type){
      case UPDATE_ENTRY_VAL:
        return R.assocPath([action.meta.parentId, action.payload.entryKey, action.payload.environment], true, state)

      case UPDATE_ENTRY:
        return R.assocPath([action.meta.parentId, action.payload.entryKey, "key"], true, state)

      case REMOVE_ENTRY:
        return R.assocPath([action.meta.parentId, action.payload.entryKey, "key"], true, state)

      case UPDATE_ENV_SUCCESS:
      case UPDATE_ENV_FAILED:
        if (isOutdatedEnvsResponse(action)){
          return state
        } else {
          const updateActionTypes = [UPDATE_ENTRY_VAL, UPDATE_ENTRY, REMOVE_ENTRY],
                dissocFns = R.pipe(
                  R.filter(R.propSatisfies(t => updateActionTypes.includes(t),'type')),
                  R.map(
                    ({payload: {entryKey, environment}})=> R.pipe(
                      R.dissocPath([action.meta.parentId, entryKey, environment]),
                      R.dissocPath([action.meta.parentId, entryKey, "key"])
                    )
                  )
                )(action.meta.envActionsPending)

          return dissocFns.length ? R.pipe(...dissocFns)(state) : state
        }

      default:
        return state
    }
  },

  isAddingSubEnv = (state = {}, action)=>{
    switch(action.type){
      case ADD_SUB_ENV:
        return R.assocPath([action.meta.parentId, action.payload.environment], true, state)

      case UPDATE_ENV_SUCCESS:
      case UPDATE_ENV_FAILED:
        if (isOutdatedEnvsResponse(action)){
          return state
        } else {
          const dissocFns = R.pipe(
                  R.filter(R.propEq("type", ADD_SUB_ENV)),
                  R.map(({payload: {environment}})=> R.dissocPath([action.meta.parentId, environment])),
                )(action.meta.envActionsPending)

          return dissocFns.length ? R.pipe(...dissocFns)(state) : state
        }

      default:
        return state
    }
  },

  isUpdatingSubEnv = (state = {}, action)=>{
    switch(action.type){
      case REMOVE_SUB_ENV:
      case RENAME_SUB_ENV:
        return R.assocPath([action.meta.parentId, action.payload.environment, action.payload.id], true, state)

      case UPDATE_ENV_SUCCESS:
      case UPDATE_ENV_FAILED:
        if (isOutdatedEnvsResponse(action)){
          return state
        } else {
          const updateActionTypes = [REMOVE_SUB_ENV, RENAME_SUB_ENV],
                dissocFns = R.pipe(
                  R.filter(R.propSatisfies(t => updateActionTypes.includes(t),'type')),
                  R.map(({payload: {environment, id}})=> R.dissocPath([action.meta.parentId, environment, id])),
                )(action.meta.envActionsPending)

          return dissocFns.length ? R.pipe(...dissocFns)(state) : state
        }

      default:
        return state
    }
  },

  isCreatingEnvEntry = (state = {}, action)=>{
    if (isClearSessionAction(action)){
      return {}
    }

    if(action.meta && action.meta.importAction){
      return state
    }
    switch(action.type){
      case CREATE_ENTRY:
        return R.assocPath([action.meta.parentId, action.payload.entryKey], true, state)

      case UPDATE_ENV_SUCCESS:
      case UPDATE_ENV_FAILED:
        if (isOutdatedEnvsResponse(action)){
          return state
        } else {
          const dissocFns = R.pipe(
                  R.filter(R.propEq('type', CREATE_ENTRY)),
                  R.map(({payload: {entryKey}})=> R.dissocPath([action.meta.parentId, entryKey]))
                )(action.meta.envActionsPending)

          return dissocFns.length ? R.pipe(...dissocFns)(state) : state
        }

      default:
        return state
    }
  }






