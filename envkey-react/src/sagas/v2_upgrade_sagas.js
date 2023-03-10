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
  V2_UPGRADE_ACCEPT_INVITE,
  V2_UPGRADE_ACCEPT_INVITE_SUCCESS,
  V2_UPGRADE_ACCEPT_INVITE_FAILED,
  V2_WAIT_FOR_CORE_PROC_ALIVE,
  V2_WAIT_FOR_CORE_PROC_ALIVE_SUCCESS,
  START_V2_ORG_USER_UPGRADE,
  START_V2_ORG_USER_UPGRADE_SUCCESS,
  START_V2_ORG_USER_UPGRADE_FAILED,
  FINISH_V2_ORG_USER_UPGRADE,
  FINISH_V2_ORG_USER_UPGRADE_SUCCESS,
  FINISH_V2_ORG_USER_UPGRADE_FAILED
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
  getEncryptedV2InviteToken,
  getCanceledV2Upgrade
} from 'selectors'
import axios from 'axios'
import semver from 'semver'
import * as crypto from 'lib/crypto'
import {signTrustedPubkeyChain} from "./helpers/crypto_helpers"

const V2_BASE_URL = "http://localhost:19047"
const V2_REQUEST_HEADERS = {}
const V2_CORE_PROC_TIMEOUT = 30000

const onStartV2UpgradeRequest = apiSaga({
  authenticated: true,
  method: "patch",
  urlSelector: getCurrentOrg,
  actionTypes: [START_V2_UPGRADE_REQUEST_SUCCESS, START_V2_UPGRADE_REQUEST_FAILED],
  urlFn: (action, currentOrg)=> `/orgs/${currentOrg.slug}/start_v2_upgrade.json`
})

const onCancelV2UpgradeRequest = apiSaga({
  authenticated: true,
  method: "patch",
  actionTypes: [CANCEL_V2_UPGRADE_SUCCESS, CANCEL_V2_UPGRADE_FAILED],
  urlSelector: getCurrentOrg,
  urlFn: (action, currentOrg)=> `/orgs/${currentOrg.slug}/cancel_v2_upgrade.json`
})

const onFinishV2UpgradeRequest = apiSaga({
  authenticated: true,
  method: "patch",
  actionTypes: [FINISH_V2_UPGRADE_SUCCESS, FINISH_V2_UPGRADE_FAILED],
  urlSelector: getCurrentOrg,
  urlFn: (action, currentOrg)=> `/orgs/${currentOrg.slug}/finish_v2_upgrade.json`
})

const onStartV2OrgUserUpgradeRequest = apiSaga({
  authenticated: true,
  method: "patch",
  actionTypes: [START_V2_ORG_USER_UPGRADE_SUCCESS, START_V2_ORG_USER_UPGRADE_FAILED],
  urlSelector: getCurrentOrg,
  urlFn: (action, currentOrg)=> `/orgs/${currentOrg.slug}/start_v2_org_user_upgrade.json`
})

const onFinishV2OrgUserUpgradeRequest = apiSaga({
  authenticated: true,
  method: "patch",
  actionTypes: [FINISH_V2_ORG_USER_UPGRADE_SUCCESS, FINISH_V2_ORG_USER_UPGRADE_FAILED],
  urlSelector: getCurrentOrg,
  urlFn: (action, currentOrg)=> `/orgs/${currentOrg.slug}/finish_v2_org_user_upgrade.json`
})


function *onCheckV2CoreProcAlive(action){
  let res

  try {
    res = yield axios({
      method: "get",
      url: `${V2_BASE_URL}/alive`,
      timeout: V2_CORE_PROC_TIMEOUT,
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
    let canceled = yield select(getCanceledV2Upgrade)
    if (canceled){
      console.log("canceled upgrade, returning from alive check loop")
      return;
    }

    yield put({type: CHECK_V2_CORE_PROC_ALIVE});

    const aliveCheckRes = yield take([
      CHECK_V2_CORE_PROC_ALIVE_SUCCESS,
      CHECK_V2_CORE_PROC_ALIVE_FAILED,
      CANCEL_V2_UPGRADE
    ])

    canceled = yield select(getCanceledV2Upgrade)

    if (aliveCheckRes.type == CANCEL_V2_UPGRADE || canceled){
      console.log("canceled upgrade, returning from alive check loop")
      return;
    }

    if (aliveCheckRes.type == CHECK_V2_CORE_PROC_ALIVE_SUCCESS){
      coreProcAlive = true;
    } else {
      yield delay(2000);
    }
  }

  yield put({type: V2_WAIT_FOR_CORE_PROC_ALIVE_SUCCESS})
}

function *onCheckV2UpgradeStatus(action){
  const v2UpgradeData = yield select(getV2UpgradeData)

  let res

  const headers = v2UpgradeData ? {...V2_REQUEST_HEADERS, authorization: JSON.stringify({
    ts: v2UpgradeData.ts,
    signature: v2UpgradeData.signature
  })} : V2_REQUEST_HEADERS

  try {
    res = yield axios({
      method: "get",
      url: `${V2_BASE_URL}/v1-upgrade-status`,
      timeout: V2_CORE_PROC_TIMEOUT,
      headers
    })
  } catch (err) {
    yield put({type: CHECK_V2_UPGRADE_STATUS_FAILED, payload: err})
    return
  }

  yield put({type: CHECK_V2_UPGRADE_STATUS_SUCCESS, payload: res.data})
}

function *onV2CoreProcLoadUpgrade(action){
  const currentOrg = yield select(getCurrentOrg)
  const currentUser = yield select(getCurrentUser)
  const upgradeToken = yield select(getUpgradeToken)
  const encryptedV2InviteToken = yield select(getEncryptedV2InviteToken)

  let res
  let data

  if (upgradeToken && encryptedV2InviteToken){
    const privkey = yield select(getPrivkey)
    const owner = yield select(getUser(currentOrg.ownerId))
    const {identityHash, encryptionKey} = yield crypto.decryptJson({
      encrypted: encryptedV2InviteToken,
      privkey,
      pubkey: owner.pubkey
    })

    data = {
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

  } else {
    const v2UpgradeData = yield select(getV2UpgradeData)
    const {fileName, encryptionKey} = yield select(getV2UpgradeArchive)

    data = {
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
          signedPresetBilling: v2UpgradeData.signedPresetBilling || undefined
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

  yield delay(2000)

  yield put({type: V2_CORE_PROC_LOAD_UPGRADE_SUCCESS})

}

function *onStartV2Upgrade(action){
  yield put({type: START_V2_UPGRADE_REQUEST})
  const startUpgradeRes = yield take([START_V2_UPGRADE_REQUEST_SUCCESS, START_V2_UPGRADE_REQUEST_FAILED, CANCEL_V2_UPGRADE])
  if (startUpgradeRes.type == START_V2_UPGRADE_REQUEST_FAILED){
    yield put({type: START_V2_UPGRADE_FAILED, payload: startUpgradeRes.payload})
    return
  }
  let canceled = yield select(getCanceledV2Upgrade)
  if (startUpgradeRes.type == CANCEL_V2_UPGRADE || canceled){
    console.log("Upgrade canceled, returning")
    return
  }

  yield put({type: V2_UPGRADE_GENERATE_ENVKEYS})
  const generateEnvkeysRes = yield take([V2_UPGRADE_GENERATE_ENVKEYS_SUCCESS, V2_UPGRADE_GENERATE_ENVKEYS_FAILED, CANCEL_V2_UPGRADE])
  if (generateEnvkeysRes.type == V2_UPGRADE_GENERATE_ENVKEYS_FAILED){
    yield put({type: START_V2_UPGRADE_FAILED, payload: generateEnvkeysRes.payload})
    return
  }

  canceled = yield select(getCanceledV2Upgrade)
  if (generateEnvkeysRes.type == CANCEL_V2_UPGRADE || canceled){
    console.log("Upgrade canceled, returning")
    return
  }


  yield put({type: EXPORT_ORG, payload: {
    isV2Upgrade: true
  }})
  const exportOrgRes = yield take([EXPORT_ORG_SUCCESS, EXPORT_ORG_FAILED, CANCEL_V2_UPGRADE])
  if (exportOrgRes.type == EXPORT_ORG_FAILED){
    yield put({type: START_V2_UPGRADE_FAILED, payload: exportOrgRes.payload})
    return
  }
  canceled = yield select(getCanceledV2Upgrade)
  if (exportOrgRes.type == CANCEL_V2_UPGRADE || canceled){
    console.log("Upgrade canceled, returning")
    return
  }

  yield put({type: V2_WAIT_FOR_CORE_PROC_ALIVE})
  const waitForAliveRes = yield take([V2_WAIT_FOR_CORE_PROC_ALIVE_SUCCESS, CANCEL_V2_UPGRADE])

  canceled = yield select(getCanceledV2Upgrade)
  if (waitForAliveRes.type == CANCEL_V2_UPGRADE || canceled){
    console.log("Upgrade canceled, returning")
    return
  }

  yield put({type: V2_CORE_PROC_LOAD_UPGRADE})


  const loadUpgradeRes = yield take([V2_CORE_PROC_LOAD_UPGRADE_SUCCESS, V2_CORE_PROC_LOAD_UPGRADE_FAILED, CANCEL_V2_UPGRADE])
  if (loadUpgradeRes.type == V2_CORE_PROC_LOAD_UPGRADE_FAILED){
    yield put({type: START_V2_UPGRADE_FAILED, payload: loadUpgradeRes.payload})
    return
  }
  canceled = yield select(getCanceledV2Upgrade)
  if (loadUpgradeRes.type == CANCEL_V2_UPGRADE || canceled){
    console.log("Upgrade canceled, returning")
    return
  }

  while (true){
    yield put({type: CHECK_V2_UPGRADE_STATUS})
    const checkUpgradeStatusRes = yield take([CHECK_V2_UPGRADE_STATUS_SUCCESS, CHECK_V2_UPGRADE_STATUS_FAILED, CANCEL_V2_UPGRADE])


    if (checkUpgradeStatusRes.type == CHECK_V2_UPGRADE_STATUS_FAILED){
      yield put({type: START_V2_UPGRADE_FAILED, payload: checkUpgradeStatusRes.payload})
      return
    }

    canceled = yield select(getCanceledV2Upgrade)
    if (checkUpgradeStatusRes.type == CANCEL_V2_UPGRADE || canceled){
      console.log("Upgrade canceled, returning")
      return
    }

    const status = yield select(getV2CoreProcUpgradeStatus)

    if (status == "error"){
      yield put({type: START_V2_UPGRADE_FAILED, payload: checkUpgradeStatusRes.payload})
      return;
    }

    if (status == "canceled"){
      yield put({type: CANCEL_V2_UPGRADE})

      const cancelRes = yield take([CANCEL_V2_UPGRADE_SUCCESS, CANCEL_V2_UPGRADE_FAILED])
      if (cancelRes.type == CANCEL_V2_UPGRADE_FAILED){
        yield put({type: START_V2_UPGRADE_FAILED, payload: cancelRes.payload})
      }

      return
    }

    if (status == "finished"){
      break;
    }

    yield delay(2000)
  }

  canceled = yield select(getCanceledV2Upgrade)
  if ( canceled){
    console.log("Upgrade canceled, returning")
    return
  }

  const inviteTokensById = yield select(getV2CoreProcInviteTokensById)
  const promises = []
  const privkey = yield select(getPrivkey)

  for (let userId in inviteTokensById){
    const user = yield select(getUser(userId))
    const orgUser = yield select(getOrgUserForUser(userId))
    const {identityHash, encryptionKey} = inviteTokensById[user.id]

    promises.push(
      crypto.encryptJson({
        data: {identityHash, encryptionKey},
        pubkey: user.pubkey,
        privkey
      }).then(encrypted => {
        return {
          [orgUser.id]: encrypted
        }
      })
    )
  }

  let encryptedInviteTokensByOrgUserId = {}
  if (promises.length > 0){
    const res = yield Promise.all(promises)
    const merged = res.reduce(R.mergeDeepRight)

    encryptedInviteTokensByOrgUserId = merged

    canceled = yield select(getCanceledV2Upgrade)
    if ( canceled){
      console.log("Upgrade canceled, returning")
      return
    }
  }

  yield put({type: FINISH_V2_UPGRADE, payload: {encryptedInviteTokensByOrgUserId}})

  const finishRes = yield take([FINISH_V2_UPGRADE_SUCCESS, FINISH_V2_UPGRADE_FAILED])

  if (finishRes.type == FINISH_V2_UPGRADE_FAILED){
    yield put({type: START_V2_UPGRADE_FAILED, payload: finishRes.payload})
    return
  }

  yield put({type: START_V2_UPGRADE_SUCCESS})
}

function *onV2UpgradeGenerateEnvkeys(action){
  const v2UpgradeData = yield select(getV2UpgradeData)
  const privkey = yield select(getPrivkey)
  const currentUser = yield select(getCurrentUser)

  const signedByTrustedPubkeys = yield call(signTrustedPubkeyChain)


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
                v2Key: key,
                signedByTrustedPubkeys,
                signedByPubkey: currentUser.pubkey,
                signedById: currentUser.id
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
  yield put({type: START_V2_ORG_USER_UPGRADE})
  const startUpgradeRes = yield take([START_V2_ORG_USER_UPGRADE_SUCCESS, START_V2_ORG_USER_UPGRADE_FAILED, CANCEL_V2_UPGRADE])
  if (startUpgradeRes.type == START_V2_ORG_USER_UPGRADE_FAILED){
    yield put({type: V2_UPGRADE_ACCEPT_INVITE_FAILED, payload: startUpgradeRes.payload})
    return
  }

  yield put({type: V2_WAIT_FOR_CORE_PROC_ALIVE})
  yield take(V2_WAIT_FOR_CORE_PROC_ALIVE_SUCCESS)

  yield put({type: V2_CORE_PROC_LOAD_UPGRADE})
  const loadUpgradeRes = yield take([V2_CORE_PROC_LOAD_UPGRADE_SUCCESS, V2_CORE_PROC_LOAD_UPGRADE_FAILED])

  if (loadUpgradeRes.type == V2_CORE_PROC_LOAD_UPGRADE_FAILED){
    yield put({type: V2_UPGRADE_ACCEPT_INVITE_FAILED, payload: loadUpgradeRes.payload})
    return
  }

  while (true){
    yield put({type: CHECK_V2_UPGRADE_STATUS})
    const checkUpgradeStatusRes = yield take([CHECK_V2_UPGRADE_STATUS_SUCCESS, CHECK_V2_UPGRADE_STATUS_FAILED])

    if (checkUpgradeStatusRes.type == CHECK_V2_UPGRADE_STATUS_FAILED){
      yield put({type: V2_UPGRADE_ACCEPT_INVITE_FAILED, payload: checkUpgradeStatusRes.payload})
      return
    }

    const status = yield select(getV2CoreProcUpgradeStatus)

    if (status == "error"){
      yield put({type: V2_UPGRADE_ACCEPT_INVITE_FAILED, payload: checkUpgradeStatusRes.payload})
      return;
    }

    if (status == "finished"){
      break;
    }

    yield delay(2000)
  }

  yield put({type: FINISH_V2_ORG_USER_UPGRADE, payload: {}})
  const finishRes = yield take([FINISH_V2_ORG_USER_UPGRADE_SUCCESS, FINISH_V2_ORG_USER_UPGRADE_FAILED])

  if (finishRes.type == FINISH_V2_ORG_USER_UPGRADE_FAILED){
    yield put({type: V2_UPGRADE_ACCEPT_INVITE_FAILED, payload: finishRes.payload})
    return
  }

  yield put({type: V2_UPGRADE_ACCEPT_INVITE_SUCCESS})
}

export default function* orgSagas(){
  yield [
    takeLatest(START_V2_UPGRADE_REQUEST, onStartV2UpgradeRequest),
    takeLatest(CANCEL_V2_UPGRADE, onCancelV2UpgradeRequest),
    takeLatest(FINISH_V2_UPGRADE, onFinishV2UpgradeRequest),

    takeLatest(START_V2_ORG_USER_UPGRADE, onStartV2OrgUserUpgradeRequest),
    takeLatest(FINISH_V2_ORG_USER_UPGRADE, onFinishV2OrgUserUpgradeRequest),

    takeLatest(START_V2_UPGRADE, onStartV2Upgrade),
    takeLatest(CHECK_V2_CORE_PROC_ALIVE, onCheckV2CoreProcAlive),
    takeLatest(V2_CORE_PROC_LOAD_UPGRADE, onV2CoreProcLoadUpgrade),
    takeLatest(V2_UPGRADE_GENERATE_ENVKEYS, onV2UpgradeGenerateEnvkeys),
    takeLatest(CHECK_V2_UPGRADE_STATUS, onCheckV2UpgradeStatus),
    takeLatest(V2_UPGRADE_ACCEPT_INVITE, onV2UpgradeAcceptInvite),
    takeLatest(V2_WAIT_FOR_CORE_PROC_ALIVE, onV2WaitForCoreProcAlive)
  ]
}