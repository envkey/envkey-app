import R from 'ramda'
import { take, put, call, select, takeEvery } from 'redux-saga/effects'
import {push} from 'react-router-redux'
import {dispatchEnvUpdateRequest} from './helpers'
import {
  getImportErrors,
  getImportActionsPending,
  getEnvsWithMetaWithPending,
  getEnvsWithMetaWithPendingWithImports,
  getEnvUpdateId,
  getCurrentOrg,
  getObject,
  getEnvironmentsAccessible
} from 'selectors'
import { allEntries, subEnvEntries } from 'lib/env/query'
import {
  QUEUE_ENVIRONMENT_IMPORT,
  QUEUE_ENVIRONMENT_IMPORT_SUCCESS,
  QUEUE_ENVIRONMENT_IMPORT_FAILED,
  IMPORT_ALL_ENVIRONMENTS,
  IMPORT_ALL_ENVIRONMENTS_SUCCESS,
  IMPORT_ALL_ENVIRONMENTS_FAILED,
  IMPORT_SINGLE_ENVIRONMENT,
  IMPORT_SINGLE_ENVIRONMENT_SUCCESS,
  IMPORT_SINGLE_ENVIRONMENT_FAILED,
  COMMIT_IMPORT_ACTIONS,
  UPDATE_ENV_SUCCESS,
  UPDATE_ENV_FAILED,
  createEntry,
  updateEntryVal,
  queueEnvironmentImport,
  commitImportActions,
  generateEnvUpdateId,
  updateObjectSettings
} from "actions"
import pluralize from 'pluralize'

function* resolveAutoCaps(meta){
  const {parentType, parentId} = meta,
        object = yield select(getObject(parentType, parentId))

  if (object.autoCaps == false){
    return
  }

  const envsWithMeta = yield select(getEnvsWithMetaWithPending(parentType, parentId)),
        entries = allEntries(envsWithMeta),
        allCaps = R.all(s => s.toUpperCase() == s)(entries)

  if (!allCaps){
    yield put(updateObjectSettings({objectType: parentType, targetId: parentId, params: {autoCaps: false}}))
  }
}

function* dispatchCommitImportActions(meta){
  let envUpdateId = yield select(getEnvUpdateId(meta.parentId))
  if (!envUpdateId){
    yield put(generateEnvUpdateId(meta))
    envUpdateId = yield select(getEnvUpdateId(meta.parentId))
  }

  const importActionsPending = yield select(getImportActionsPending(meta.parentId))

  yield put(commitImportActions({...meta, importActionsPending, envUpdateId}))

  const resAction = yield take([UPDATE_ENV_SUCCESS, UPDATE_ENV_FAILED])

  return resAction
}

function* onImportEnvironment({
  payload: {parsed, environment, subEnvId, format},
  meta
}){
  if(R.isEmpty(parsed))return

  const {parentType, parentId} = meta,
        envsWithMeta = yield select(getEnvsWithMetaWithPendingWithImports(parentType, parentId)),
        entries = new Set(subEnvId ? subEnvEntries(envsWithMeta, subEnvId) : allEntries(envsWithMeta)),
        environments = subEnvId ? [subEnvId] : (yield select(getEnvironmentsAccessible(parentId)))

  for (let entryKey in parsed){
    let val = parsed[entryKey]
    if(!entries.has(entryKey)){
      yield put(createEntry({
        ...meta,
        entryKey,
        vals:  R.pipe(
          R.map(e => ({[e]: {val: null, inherits: null}})),
          R.mergeAll,
          R.assoc((subEnvId || environment), {val, inherits: null})
        )(environments),
        subEnvId,
        importAction: true
      }))
    } else {
      yield put(updateEntryVal({
        ...meta,
        entryKey,
        subEnvId,
        environment: (subEnvId || environment),
        importAction: true,
        update: { val }
      }))
    }
  }

  yield put({type: QUEUE_ENVIRONMENT_IMPORT_SUCCESS, meta})
}

function* onImportAllEnvironments({meta, payload: {parsedByEnvironment}}){
  for (let environment in parsedByEnvironment){
    let parsed = parsedByEnvironment[environment]
    yield put(queueEnvironmentImport({...meta, parsed, environment }))
    yield take([QUEUE_ENVIRONMENT_IMPORT_SUCCESS, QUEUE_ENVIRONMENT_IMPORT_FAILED])
  }

  const importErrors = yield select(getImportErrors(meta.parentId))

  if (!importErrors || R.isEmpty(importErrors)){
    const commitRes = yield call(dispatchCommitImportActions, meta)

    if (commitRes.error){
      yield put({type: IMPORT_ALL_ENVIRONMENTS_FAILED, meta, error: true, payload: resAction.payload})
    } else {
      const {parentType, parentId} = meta,
            currentOrg = yield select(getCurrentOrg),
            object = yield select(getObject(parentType, parentId))

      yield put({type: IMPORT_ALL_ENVIRONMENTS_SUCCESS, meta})
      yield call(resolveAutoCaps, meta)
      yield put(push(`/${currentOrg.slug}/${pluralize(parentType)}/${object.slug}`))
    }

  } else {
    yield put({
      meta,
      type: IMPORT_ALL_ENVIRONMENTS_FAILED,
      error: true,
      payload: importErrors
    })
  }
}

function* onImportSingleEnvironment({meta, payload: {parsed, environment}}){
  yield put(queueEnvironmentImport({...meta, parsed, environment }))
  yield take([QUEUE_ENVIRONMENT_IMPORT_SUCCESS, QUEUE_ENVIRONMENT_IMPORT_FAILED])

  const importErrors = yield select(getImportErrors(meta.parentId))

  if (!importErrors || R.isEmpty(importErrors)){
    const commitRes = yield call(dispatchCommitImportActions, meta)

    if (commitRes.error){
      yield put({type: IMPORT_SINGLE_ENVIRONMENT_FAILED, meta, error: true, payload: resAction.payload})
    } else {
      const {parentType, parentId} = meta,
            currentOrg = yield select(getCurrentOrg),
            object = yield select(getObject(parentType, parentId))

      yield put({type: IMPORT_SINGLE_ENVIRONMENT_SUCCESS, meta})
      yield call(resolveAutoCaps, meta)
    }

  } else {
    yield put({
      meta,
      type: IMPORT_SINGLE_ENVIRONMENT_FAILED,
      error: true,
      payload: importErrors
    })
  }
}

function* onCommitImportActions({meta}){
  yield call(dispatchEnvUpdateRequest, {...meta, skipDelay: true})
}

export default function* importSagas(){
  yield [
    takeEvery(IMPORT_ALL_ENVIRONMENTS, onImportAllEnvironments),
    takeEvery(IMPORT_SINGLE_ENVIRONMENT, onImportSingleEnvironment),
    takeEvery(QUEUE_ENVIRONMENT_IMPORT, onImportEnvironment),
    takeEvery(COMMIT_IMPORT_ACTIONS, onCommitImportActions)
  ]
}
