import { takeLatest, take, put, select, call} from 'redux-saga/effects'
import {delay} from 'redux-saga'
import { push } from 'react-router-redux'
import R from 'ramda'
import {
  apiSaga
} from './helpers'
import {
  START_V2_UPGRADE,
  START_V2_UPGRADE_REQUEST,
  START_V2_UPGRADE_REQUEST_SUCCESS,
  START_V2_UPGRADE_REQUEST_FAILED,
  START_V2_UPGRADE_SUCCESS,
  START_V2_UPGRADE_FAILED,
  CANCEL_V2_UPGRADE,
  CANCEL_V2_UPGRADE_REQUEST,
  CANCEL_V2_UPGRADE_SUCCESS,
  CANCEL_V2_UPGRADE_FAILED,
  FINISH_V2_UPGRADE,
  FINISH_V2_UPGRADE_REQUEST,
  FINISH_V2_UPGRADE_SUCCESS,
  FINISH_V2_UPGRADE_FAILED,
  EXPORT_ORG,
  EXPORT_ORG_SUCCESS,
  EXPORT_ORG_FAILED,
  CHECK_V2_CORE_PROC_ALIVE,
  CHECK_V2_CORE_PROC_ALIVE_SUCCESS,
  CHECK_V2_CORE_PROC_ALIVE_FAILED,
  V2_CORE_PROC_LOAD_UPGRADE,
  V2_CORE_PROC_LOAD_UPGRADE_SUCCESS,
  V2_CORE_PROC_LOAD_UPGRADE_FAILED,
  V2_UPGRADE_GENERATE_ENVKEYS,
  V2_UPGRADE_GENERATE_ENVKEYS_SUCCESS,
  V2_UPGRADE_GENERATE_ENVKEYS_FAILED,
  CHECK_V2_UPGRADE_STATUS,
  CHECK_V2_UPGRADE_STATUS_SUCCESS,
  CHECK_V2_UPGRADE_STATUS_FAILED,
  STORE_V2_UPGRADE_TOKENS,
  STORE_V2_UPGRADE_TOKENS_SUCCESS,
  STORE_V2_UPGRADE_TOKENS_FAILED,
  V2_UPGRADE_ACCEPT_INVITE,
  V2_UPGRADE_ACCEPT_INVITE_SUCCESS,
  V2_UPGRADE_ACCEPT_INVITE_FAILED,
  V2_WAIT_FOR_CORE_PROC_ALIVE,
  V2_WAIT_FOR_CORE_PROC_ALIVE_SUCCESS
} from 'actions'
import {
  getCurrentOrg,
  getCurrentUser,
  getV2UpgradeData,
  getV2UpgradeArchive,
  getPrivkey,
  getV2UpgradeEnvkeys,
  getV2CoreProcUpgradeStatus,
  getV2CoreProcInviteTokensById,
  getUser,
  getOrgUserForUser,
  getServer,
  getLocalKey,
  getUpgradeToken,
  getEncryptedV2InviteToken
} from 'selectors'
import axios from 'axios'
import semver from 'semver'
import * as crypto from 'lib/crypto'

const V2_BASE_URL = "https://56d6-2601-646-c300-5a90-fcfe-ef8e-e914-4ac.ngrok.io"
const V2_REQUEST_HEADERS = {"ngrok-skip-browser-warning": 1}

const onStartV2UpgradeRequest = apiSaga({
  authenticated: true,
  method: "patch",
  urlSelector: getCurrentOrg,
  actionTypes: [START_V2_UPGRADE_REQUEST_SUCCESS, START_V2_UPGRADE_REQUEST_FAILED],
  urlFn: (action, currentOrg)=> `/orgs/${currentOrg.slug}/start_v2_upgrade.json`
})

const onStoreUpgradeTokens = apiSaga({
  authenticated: true,
  method: "patch",
  urlSelector: getCurrentOrg,
  actionTypes: [STORE_V2_UPGRADE_TOKENS_SUCCESS, STORE_V2_UPGRADE_TOKENS_FAILED],
  urlFn: (action, currentOrg)=> `/orgs/${currentOrg.slug}/store_v2_upgrade_tokens.json`
})

const onCancelV2UpgradeRequest = apiSaga({
  authenticated: true,
  method: "patch",
  actionTypes: [CANCEL_V2_UPGRADE_SUCCESS, CANCEL_V2_UPGRADE_FAILED],
  urlFn: (action)=> `/cancel_v2_upgrade.json`
})

const onFinishV2UpgradeRequest = apiSaga({
  authenticated: true,
  method: "patch",
  actionTypes: [FINISH_V2_UPGRADE_SUCCESS, FINISH_V2_UPGRADE_FAILED],
  urlFn: (action)=> `/finish_v2_upgrade.json`
})

function *onCheckV2CoreProcAlive(action){
  let res

  try {
    res = yield axios({
      method: "get",
      url: `${V2_BASE_URL}/alive`,
      timeout: 3000,
      headers: V2_REQUEST_HEADERS,
    })
  } catch (err) {
    yield put({type: CHECK_V2_CORE_PROC_ALIVE_FAILED, payload: err})
    return
  }

  if (!res.data.cliVersion || !semver.gte(res.data.cliVersion, "2.3.0")){
    yield put({type: CHECK_V2_CORE_PROC_ALIVE_FAILED, payload: new Error("EnvKey v2 CLI version >= 2.3.0 required")})
    return
  }

  yield put({type: CHECK_V2_CORE_PROC_ALIVE_SUCCESS})
}

function *onV2WaitForCoreProcAlive(action){
  let coreProcAlive = false;

  while (!coreProcAlive){
    yield put({type: CHECK_V2_CORE_PROC_ALIVE});

    const aliveCheckRes = yield take([CHECK_V2_CORE_PROC_ALIVE_SUCCESS, CHECK_V2_CORE_PROC_ALIVE_FAILED])

    if (aliveCheckRes.type == CHECK_V2_CORE_PROC_ALIVE_SUCCESS){
      coreProcAlive = true;
    } else {
      yield delay(2000);
    }
  }

  yield put({type: V2_WAIT_FOR_CORE_PROC_ALIVE_SUCCESS})
}

function *onCheckV2UpgradeStatus(action){
  let res

  try {
    res = yield axios({
      method: "get",
      url: `${V2_BASE_URL}/v1-upgrade-status`,
      timeout: 3000,
      headers: V2_REQUEST_HEADERS,
    })
  } catch (err) {
    yield put({type: CHECK_V2_UPGRADE_STATUS_FAILED, payload: err})
    return
  }

  yield put({type: CHECK_V2_UPGRADE_STATUS_SUCCESS, payload: res.data})
}

function *onV2CoreProcLoadUpgrade(action){
  const v2UpgradeData = yield select(getV2UpgradeData)
  const {fileName, encryptionKey} = yield select(getV2UpgradeArchive)
  const currentOrg = yield select(getCurrentOrg)
  const currentUser = yield select(getCurrentUser)

  let res

  const data = {
    action: {
      type: "envkey/client/LOAD_V1_UPGRADE",
      payload: {
        fileName,
        encryptionKey,
        orgName: currentOrg.name,
        creator: {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email
        },
        ts: v2UpgradeData.ts,
        signature: v2UpgradeData.signature,
        stripeCustomerId: v2UpgradeData.stripeCustomerId,
        stripeSubscriptionId: v2UpgradeData.stripeSubscriptionId,
        numUsers: v2UpgradeData.numUsers,
      }
    },
    context: {
      client: {
        clientName: "v1",
        clienVersion: "1.4.0"
      },
      clientId: "v1",
      accountIdOrCliKey: undefined
    }
   }

  try {
    res = yield axios({
      method: "post",
      url: `${V2_BASE_URL}/action`,
      timeout: 5000,
      headers: V2_REQUEST_HEADERS,
      data
    })
  } catch (err) {
    yield put({type: V2_CORE_PROC_LOAD_UPGRADE_FAILED, payload: err})
    return
  }

  yield put({type: V2_CORE_PROC_LOAD_UPGRADE_SUCCESS})

}

function *onStartV2Upgrade(action){
  yield put({type: START_V2_UPGRADE_REQUEST})
  const startUpgradeRes = yield take([START_V2_UPGRADE_REQUEST_SUCCESS, START_V2_UPGRADE_REQUEST_FAILED])
  if (startUpgradeRes.type == START_V2_UPGRADE_REQUEST_FAILED){
    yield put({type: START_V2_UPGRADE_FAILED, payload: startUpgradeRes.payload})
    return
  }

  yield put({type: V2_UPGRADE_GENERATE_ENVKEYS})
  const generateEnvkeysRes = yield take([V2_UPGRADE_GENERATE_ENVKEYS_SUCCESS, V2_UPGRADE_GENERATE_ENVKEYS_FAILED])
  if (generateEnvkeysRes.type == V2_UPGRADE_GENERATE_ENVKEYS_FAILED){
    yield put({type: START_V2_UPGRADE_FAILED, payload: generateEnvkeysRes.payload})
    return
  }


  yield put({type: EXPORT_ORG, payload: {
    isV2Upgrade: true
  }})
  const exportOrgRes = yield take([EXPORT_ORG_SUCCESS, EXPORT_ORG_FAILED])
  if (exportOrgRes.type == EXPORT_ORG_FAILED){
    yield put({type: START_V2_UPGRADE_FAILED, payload: exportOrgRes.payload})
    return
  }

  yield put({type: V2_WAIT_FOR_CORE_PROC_ALIVE})
  yield take(V2_WAIT_FOR_CORE_PROC_ALIVE_SUCCESS)

  yield put({type: V2_CORE_PROC_LOAD_UPGRADE})


  const loadUpgradeRes = yield take([V2_CORE_PROC_LOAD_UPGRADE_SUCCESS, V2_CORE_PROC_LOAD_UPGRADE_FAILED])
  if (loadUpgradeRes.type == V2_CORE_PROC_LOAD_UPGRADE_FAILED){
    yield put({type: START_V2_UPGRADE_FAILED, payload: loadUpgradeRes.payload})
    return
  }

  while (true){
    yield put({type: CHECK_V2_UPGRADE_STATUS})
    const checkUpgradeStatusRes = yield take([CHECK_V2_UPGRADE_STATUS_SUCCESS, CHECK_V2_UPGRADE_STATUS_FAILED])

    if (checkUpgradeStatusRes.type == CHECK_V2_UPGRADE_STATUS_FAILED){
      yield put({type: START_V2_UPGRADE_FAILED, payload: checkUpgradeStatusRes.payload})
      return
    }

    const status = yield select(getV2CoreProcUpgradeStatus)

    if (status == "error"){
      yield put({type: START_V2_UPGRADE_FAILED, payload: checkUpgradeStatusRes.payload})
      return
    }

    if (status == "finished"){
      break;
    }

    yield delay(2000)
  }


  const inviteTokensById = yield select(getV2CoreProcInviteTokensById)
  const promises = []
  const privkey = yield select(getPrivkey)

  for (let userId in inviteTokensById){
    const user = yield select(getUser(userId))
    const orgUser = yield select(getOrgUserForUser(userId))
    const {identityHash, encryptionKey} = inviteTokensById[user.id]

    promises.push(
      crypto.encryptJson({data: {identityHash, encryptionKey}, pubkey: user.pubkey, privkey }).then(encrypted => {
        return {
          [orgUser.id]: encrypted
        }
      })
    )
  }

  if (promises.length > 0){
    const res = yield Promise.all(promises)
    const merged = res.reduce(R.mergeDeepRight)

    yield put({type: STORE_V2_UPGRADE_TOKENS, payload: {encryptedInviteTokensByOrgUserId: merged}})

    const storeUpgradeTokensRes = yield take([STORE_V2_UPGRADE_TOKENS_SUCCESS, STORE_V2_UPGRADE_TOKENS_FAILED])

    if (storeUpgradeTokensRes.type == STORE_V2_UPGRADE_TOKENS_FAILED){
      yield put({type: START_V2_UPGRADE_FAILED, payload: storeUpgradeTokensRes.payload})
      return
    }
  }
}

function *onCancelV2Upgrade(action){

}

function *onFinishV2Upgrade(action){

}

function *onV2UpgradeGenerateEnvkeys(action){
  const v2UpgradeData = yield select(getV2UpgradeData)
  const privkey = yield select(getPrivkey)


  try {
    const promises = [];

    for (let [obj, selector] of [[v2UpgradeData.serversById, getServer], [v2UpgradeData.localKeysById, getLocalKey]]){
      for (let id in obj){
        const {pubkey} = yield select(selector(id))

        const key = crypto.secureRandomAlphanumeric(22)

        promises.push(
          crypto.encryptJson({data: {KEY: key}, pubkey, privkey }).then(encrypted => {
            return {
              [id]: {
                encryptedV2Key: encrypted,
                v2Key: key
              }
            }
          })
        )
      }
    }

    let merged = {}
    if (promises.length > 0){
      const res = yield Promise.all(promises)
      merged = res.reduce(R.mergeDeepRight)
    }

    yield put({
      type: V2_UPGRADE_GENERATE_ENVKEYS_SUCCESS,
      payload: merged
    })
  } catch (err){
     yield put({
      type: V2_UPGRADE_GENERATE_ENVKEYS_FAILED,
      payload: err
    })
  }
}

function* onV2UpgradeAcceptInvite(action){
  const privkey = yield select(getPrivkey)
  const upgradeToken = yield select(getUpgradeToken)
  const encryptedV2InviteToken = yield select(getEncryptedV2InviteToken)
  const currentUser = yield select(getCurrentUser)
  const currentOrg = yield select(getCurrentOrg)
  const owner = yield select(getUser(currentOrg.ownerId))
  const {identityHash, encryptionKey} = yield crypto.decryptJson({
    encrypted: encryptedV2InviteToken,
    privkey,
    pubkey: owner.pubkey
  })

  let res

  const data = {
    action: {
      type: "envkey/client/LOAD_V1_UPGRADE_INVITE",
      payload: {
        upgradeToken,
        encryptionToken: [identityHash, encryptionKey].join("_")
      }
    },
    context: {
      client: {
        clientName: "v1",
        clienVersion: "1.4.0"
      },
      clientId: "v1",
      accountIdOrCliKey: undefined
    }
   }

  try {
    res = yield axios({
      method: "post",
      url: `${V2_BASE_URL}/action`,
      timeout: 5000,
      headers: V2_REQUEST_HEADERS,
      data
    })
  } catch (err) {
    yield put({type: V2_UPGRADE_ACCEPT_INVITE_FAILED, payload: err})
    return
  }

  yield put({type: V2_UPGRADE_ACCEPT_INVITE_SUCCESS})
}

export default function* orgSagas(){
  yield [
    takeLatest(START_V2_UPGRADE_REQUEST, onStartV2UpgradeRequest),
    takeLatest(CANCEL_V2_UPGRADE_REQUEST, onCancelV2UpgradeRequest),
    takeLatest(FINISH_V2_UPGRADE_REQUEST, onFinishV2UpgradeRequest),
    takeLatest(START_V2_UPGRADE, onStartV2Upgrade),
    takeLatest(CANCEL_V2_UPGRADE, onCancelV2Upgrade),
    takeLatest(FINISH_V2_UPGRADE, onFinishV2Upgrade),
    takeLatest(CHECK_V2_CORE_PROC_ALIVE, onCheckV2CoreProcAlive),
    takeLatest(V2_CORE_PROC_LOAD_UPGRADE, onV2CoreProcLoadUpgrade),
    takeLatest(V2_UPGRADE_GENERATE_ENVKEYS, onV2UpgradeGenerateEnvkeys),
    takeLatest(CHECK_V2_UPGRADE_STATUS, onCheckV2UpgradeStatus),
    takeLatest(STORE_V2_UPGRADE_TOKENS, onStoreUpgradeTokens),
    takeLatest(V2_UPGRADE_ACCEPT_INVITE, onV2UpgradeAcceptInvite),
    takeLatest(V2_WAIT_FOR_CORE_PROC_ALIVE, onV2WaitForCoreProcAlive)
  ]
}