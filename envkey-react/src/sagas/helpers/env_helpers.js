import { put, select, call } from 'redux-saga/effects'
import R from 'ramda'
import {envParamsForApp} from './attach_envs_helpers'
import {signTrustedPubkeyChain} from './crypto_helpers'
import {
  getEnvsWithMetaWithPending,
  getEnvActionsPendingByEnvUpdateId,
  getEnvUpdateId,
  getIsRequestingEnvUpdate,
  getHasEnvActionsPending,
  getObject,
  getSocketUserUpdatingEnvs,
  getServersForSubEnv,
  getCurrentOrg,
  getAppUserBy
} from 'selectors'
import {
  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
  updateEnvRequest,
  removeAssoc,
  addAssoc
} from "actions"
import { s3Client } from 'lib/s3'
import { secureRandomAlphanumeric } from 'lib/crypto'

let dispatchingEnvUpdateId

export function* dispatchEnvUpdateRequest(params){
  const {meta={}, parentId, parentType, skipDelay, updatePending} = params,
        envUpdateId = meta.forceEnvUpdateId || (yield select(getEnvUpdateId(parentId)))

  if(dispatchingEnvUpdateId == envUpdateId && !updatePending)return
  dispatchingEnvUpdateId = envUpdateId

  const
    parent = yield select(getObject(parentType, parentId)),
    envsWithMeta = yield select(getEnvsWithMetaWithPending(parentType, parentId)),
    envActionsPendingBefore = yield select(getEnvActionsPendingByEnvUpdateId(parentId, envUpdateId)),
    envParams = yield call(envParamsForApp, {appId: parentId, envsWithMeta}),
    signedByTrustedPubkeys = yield call(signTrustedPubkeyChain),
    envActionsPending = yield select(getEnvActionsPendingByEnvUpdateId(parentId, envUpdateId))

  if (envActionsPendingBefore.length != envActionsPending.length){
    yield call(dispatchEnvUpdateRequest, {...params, updatePending: true})
    return
  }

  const currentOrg = yield select(getCurrentOrg),
        client = s3Client()

  if (currentOrg.storageStrategy == "s3"){
    const requestQueue = [],
          envParamUrls = {}

    if (envParams.users){
      for (let userId in envParams.users){
        let apps = envParams.users[userId].apps
        for (let appId in apps){
          let appEnvsWithMeta  = apps[appId].envsWithMeta,
              appUser = yield select(getAppUserBy({userId, appId}))

          for (let env in appEnvsWithMeta){
            let s3Info = appUser.s3UploadInfo[env]

            if (s3Info){
              let fields = JSON.parse(s3Info.fields),
                  data = new FormData()

              for (let k in fields){
                data.append(k, fields[k])
              }

              let secret = secureRandomAlphanumeric(20)
              data.append('key', s3Info.path + secret)
              data.append('file', new Blob([JSON.stringify({env: appEnvsWithMeta[env]})]),{type:'application/json', filename: secret + ".json"})
              data.append('Content-Type', 'application/json')

              requestQueue.push(client.post(s3Info.url + "/", data))
            }
          }
        }
      }
    }

    if (envParams.localKeys){

    }

    if (envParams.servers){

    }

    const results = yield requestQueue
  }




  yield put(updateEnvRequest({
    ...meta,
    parentType,
    parentId,
    envActionsPending,
    skipDelay,
    envUpdateId,
    signedByTrustedPubkeys,
    updatedEnvsWithMeta: envsWithMeta,
    envs: envParams,
    envsUpdatedAt: parent.envsUpdatedAt,
    keyablesUpdatedAt: parent.keyablesUpdatedAt
  }))
  dispatchingEnvUpdateId = null
}

export function* dispatchEnvUpdateRequestIfNeeded(params){
  const {parentId} = params,
        hasPending = yield select(getHasEnvActionsPending(parentId)),
        isRequestingEnvUpdate = yield select(getIsRequestingEnvUpdate(parentId)),
        socketUserUpdatingEnvs = yield select(getSocketUserUpdatingEnvs(parentId))

  if (hasPending && !isRequestingEnvUpdate && !socketUserUpdatingEnvs){
    yield call(dispatchEnvUpdateRequest, params)
  }
}

export function* clearSubEnvServersIfNeeded({meta: {envActionsPending, parentId}}){
  const removeSubEnvActions = envActionsPending.filter(R.propEq("type", REMOVE_SUB_ENV))

  for (let {meta: {id}} of removeSubEnvActions){
    let servers = yield select(getServersForSubEnv(parentId, id))

    for (let server of servers){
      yield put(removeAssoc({parentId, parentType: "app", assocType: "server", targetId: server.id}))
    }
  }
}

export function* addDefaultSubEnvServerIfNeeded({meta: {envActionsPending, parentId}}){
  const addSubEnvActions = envActionsPending.filter(R.propEq("type", ADD_SUB_ENV))

  for (let {payload: {environment, name, id: subEnvId}} of addSubEnvActions){
    yield put(addAssoc({
      parentId,
      subEnvId,
      name: `${name} Key`,
      role: environment,
      parentType: "app",
      assocType: "server",
      skipKeygen: true,
      undeletable: true
    }))
  }
}
