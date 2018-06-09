import { take, put, call, select, takeEvery, takeLatest } from 'redux-saga/effects'
import { push } from 'react-router-redux'
import isElectron from 'is-electron'
import {
  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
} from "actions"

function* onAddSubEnv({payload: {environment, id}}){
  const path = isElectron() ? window.location.hash.replace("#", "") : window.location.href,
        newPath = path.replace(new RegExp(`/${environment}/add$`), `/${environment}/${id}`)

  yield put(push(newPath))
}

function* onRemoveSubEnv({payload: {environment, id}}){
  const path = isElectron() ? window.location.hash.replace("#", "") : window.location.href,
        newPath = path.replace(new RegExp(`/${environment}/${id}$`),`/${environment}/first`)
  if(path != newPath)yield put(push(newPath))
}

export default function* envSagas(){
  yield [
    takeLatest(ADD_SUB_ENV, onAddSubEnv),
    takeLatest(REMOVE_SUB_ENV, onRemoveSubEnv)
  ]
}