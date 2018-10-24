import { take, put, call, select, takeEvery, takeLatest } from 'redux-saga/effects'
import { push } from 'react-router-redux'
import isElectron from 'is-electron'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,
  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
  RENAME_SUB_ENV,
  socketBroadcastEnvsStatus
} from "actions"

function* onTransformEnv(action){
  if(!action.meta.importAction && !action.meta.queued){
    yield put(socketBroadcastEnvsStatus())
  }
}

function* onAddSubEnv({payload: {parentEnvironment, id}}){
  const path = isElectron() ? window.location.hash.replace("#", "") : window.location.href,
        newPath = path.replace(new RegExp(`/${parentEnvironment}/add$`), `/${parentEnvironment}/${id}`)

  yield put(push(newPath))
}

function* onRemoveSubEnv({payload: {parentEnvironment, id}}){
  const path = isElectron() ? window.location.hash.replace("#", "") : window.location.href,
        newPath = path.replace(new RegExp(`/${parentEnvironment}/${id}$`),`/${parentEnvironment}/first`)
  if(path != newPath)yield put(push(newPath))
}

export default function* envSagas(){
  yield [
    takeEvery([
      CREATE_ENTRY,
      UPDATE_ENTRY,
      REMOVE_ENTRY,
      UPDATE_ENTRY_VAL,
      ADD_SUB_ENV,
      REMOVE_SUB_ENV,
      RENAME_SUB_ENV
    ], onTransformEnv),
    takeLatest(ADD_SUB_ENV, onAddSubEnv),
    takeLatest(REMOVE_SUB_ENV, onRemoveSubEnv)
  ]
}