import { take, put, call, select, takeEvery } from 'redux-saga/effects'
import {push} from 'react-router-redux'
import {
  getCurrentOrg,
  getObject
} from 'selectors'
import {
  IMPORT_ALL_ENVIRONMENTS_SUCCESS
} from "actions"

import pluralize from 'pluralize'

function* onImportAllEnvironmentsSuccess({meta}){
  const {parentType, parentId} = meta,
        currentOrg = yield select(getCurrentOrg),
        object = yield select(getObject(parentType, parentId))

  yield put(push(`/${currentOrg.slug}/${pluralize(parentType)}/${object.slug}`))
}

export default function* importSagas(){
  yield [
    takeEvery(IMPORT_ALL_ENVIRONMENTS_SUCCESS, onImportAllEnvironmentsSuccess)
  ]
}
