import R from 'ramda'
import { take, put, call, select, takeEvery } from 'redux-saga/effects'
import {push} from 'react-router-redux'
import {dispatchEnvUpdateRequest} from './helpers'
import {
  getImportErrors,
  getImportActionsPending,
  getEnvsWithMetaWithPendingWithImports,
  getEntries,
  getEnvUpdateId,
  getCurrentOrg,
  getObject,
  getEnvironmentsAccessible
} from 'selectors'
import {
  IMPORT_ENVIRONMENT,
  IMPORT_ENVIRONMENT_SUCCESS,
  IMPORT_ENVIRONMENT_FAILED,
  IMPORT_ALL_ENVIRONMENTS,
  IMPORT_ALL_ENVIRONMENTS_SUCCESS,
  IMPORT_ALL_ENVIRONMENTS_FAILED,
  COMMIT_IMPORT_ACTIONS,
  UPDATE_ENV_SUCCESS,
  UPDATE_ENV_FAILED,
  createEntry,
  updateEntryVal,
  importEnvironment,
  commitImportActions,
  generateEnvUpdateId
} from "actions"
import pluralize from 'pluralize'
import { dotenv } from 'lib/parse'

function* dispatchCommitImportActions(meta){
  let envUpdateId = yield select(getEnvUpdateId(meta.parentId))
  if (!envUpdateId){
    yield put(generateEnvUpdateId(meta))
    envUpdateId = yield select(getEnvUpdateId(meta.parentId))
  }

  const importActionsPending = yield select(getImportActionsPending(meta.parentId))

  yield put(commitImportActions({...meta, importActionsPending, envUpdateId}))
}

function* parseText(text, format, {environment, meta}){
  try {
    if(format == "env"){
      return dotenv(text)
    }
  } catch (e){
    yield put({
      type: IMPORT_ENVIRONMENT_FAILED,
      error: true,
      payload: e,
      meta: {...meta, environment}
    })
    return null
  }
}

function* onImportEnvironment({
  payload: {text, environment, format},
  meta
}){
  if(!text || !text.trim())return

  const parsed = yield call(parseText, text, format, {environment, meta})
  if(!parsed || R.isEmpty(parsed))return

  const {parentType, parentId} = meta,
        envsWithMeta = yield select(getEnvsWithMetaWithPendingWithImports(parentType, parentId)),
        entries = new Set(getEntries(envsWithMeta)),
        environments = yield select(getEnvironmentsAccessible(parentId))

  for (let entryKey in parsed){
    let val = parsed[entryKey]
    if(!entries.has(entryKey)){
      yield put(createEntry({
        ...meta,
        entryKey,
        vals:  R.pipe(
          R.map(e => ({[e]: {val: null, inherits: null}})),
          R.mergeAll,
          R.assoc(environment, {val, inherits: null})
        )(environments),
        importAction: true
      }))
    } else {
      yield put(updateEntryVal({
        ...meta,
        entryKey,
        environment,
        importAction: true,
        update: { val }
      }))
    }
  }

  yield put({type: IMPORT_ENVIRONMENT_SUCCESS, meta})
}

function* onImportAllEnvironments({meta, payload: {textByEnvironment, format}}){
  for (let environment in textByEnvironment){
    let text = textByEnvironment[environment]
    yield put(importEnvironment({...meta, text, environment, format, noCommit: true}))
    yield take([IMPORT_ENVIRONMENT_SUCCESS, IMPORT_ENVIRONMENT_FAILED])
  }

  const importErrors = yield select(getImportErrors(meta.parentId))

  if (!importErrors || R.isEmpty(importErrors)){
    yield call(dispatchCommitImportActions, meta)
  } else {
    yield put({
      meta,
      type: IMPORT_ALL_ENVIRONMENTS_FAILED,
      error: true
    })
  }
}

function* onCommitImportActions({meta}){
  yield call(dispatchEnvUpdateRequest, {...meta, skipDelay: true})

  const resAction = yield take([UPDATE_ENV_SUCCESS, UPDATE_ENV_FAILED])

  if(resAction.type == UPDATE_ENV_SUCCESS){
    const {parentType, parentId} = meta,
          currentOrg = yield select(getCurrentOrg),
          object = yield select(getObject(parentType, parentId))

    yield put({type: IMPORT_ALL_ENVIRONMENTS_SUCCESS, meta})
    yield put(push(`/${currentOrg.slug}/${pluralize(parentType)}/${object.slug}`))
  } else {
    yield put({type: IMPORT_ALL_ENVIRONMENTS_FAILED, meta, error:true, payload: resAction.payload})
  }
}

export default function* importSagas(){
  yield [
    takeEvery(IMPORT_ALL_ENVIRONMENTS, onImportAllEnvironments),
    takeEvery(IMPORT_ENVIRONMENT, onImportEnvironment),
    takeEvery(COMMIT_IMPORT_ACTIONS, onCommitImportActions)
  ]
}
