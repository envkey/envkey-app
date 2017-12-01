import { put, take, call } from 'redux-saga/effects'
import {
  CREATE_OBJECT_REQUEST,
  CREATE_OBJECT_SUCCESS,
  CREATE_OBJECT_FAILED,

  ADD_ASSOC_SUCCESS,
  ADD_ASSOC_FAILED,

  CREATE_ASSOC_SUCCESS,
  CREATE_ASSOC_FAILED,

  addAssoc
} from 'actions'

export function *dispatchCreateAssocSuccess({meta}){
  yield put({type: CREATE_ASSOC_SUCCESS, meta})
}

export function *dispatchCreateAssocFailed({failAction, meta}){
  yield put({...failAction, meta, type: CREATE_ASSOC_FAILED})
}

export function *execCreateObject({meta, payload}){
  yield put({
    type: CREATE_OBJECT_REQUEST,
    meta: {objectType: meta.assocType, createAssoc: true},
    payload
  })

  const createResultAction = yield take([CREATE_OBJECT_SUCCESS, CREATE_OBJECT_FAILED])
  return createResultAction
}

export function *execAddAssoc({meta, payload}, assocId, isCreatingAssoc){
  yield put(addAssoc({...meta, assocId, isCreatingAssoc}))
  const addResultAction = yield take([ADD_ASSOC_SUCCESS, ADD_ASSOC_FAILED])
  return addResultAction
}

export function* execCreateAssoc(action){
  let failAction, addResultAction
  const {meta, payload} = action,
        createResultAction = yield call(execCreateObject, action)
  if (createResultAction.type == CREATE_OBJECT_SUCCESS){
    if(meta.createOnly){
      yield call(dispatchCreateAssocSuccess, action)
    } else {
      addResultAction = yield call(execAddAssoc, action, createResultAction.payload.id, true)
      if (addResultAction.type == ADD_ASSOC_SUCCESS){
        yield call(dispatchCreateAssocSuccess, action)
      } else {
        failAction = addResultAction
      }
    }
  } else {
    failAction = createResultAction
  }
  if(failAction)yield call(dispatchCreateAssocFailed, {failAction, meta})

  return {createResultAction, addResultAction, failAction}
}
