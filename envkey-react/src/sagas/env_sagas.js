import { take, put, call, select, takeEvery, takeLatest } from 'redux-saga/effects'
import { push } from 'react-router-redux'
import isElectron from 'is-electron'
import {
  ActionType,
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
      ActionType.CREATE_ENTRY,
      ActionType.UPDATE_ENTRY,
      ActionType.REMOVE_ENTRY,
      ActionType.UPDATE_ENTRY_VAL,
      ActionType.ADD_SUB_ENV,
      ActionType.REMOVE_SUB_ENV,
      ActionType.RENAME_SUB_ENV
    ], onTransformEnv),
    takeLatest(ActionType.ADD_SUB_ENV, onAddSubEnv),
    takeLatest(ActionType.REMOVE_SUB_ENV, onRemoveSubEnv)
  ]
}