import { select, call } from 'redux-saga/effects'
import R from 'ramda'
import { keyableIsTrusted } from './crypto_helpers'
import pluralize from 'pluralize'
import {
  getUser,
  getApp,
  getApps,
  getAppUserBy,
  getAppsForUser,
  getUsersForApp,
  getLocalKey,
  getLocalKeysWithPubkeyForAppUser,
  getLocalKeysWithPubkeyForApp,
  getServer,
  getServersWithPubkeyForApp,
  getPrivkey
} from 'selectors'
import { s3Client } from 'lib/s3'
import {orgRoleIsAdmin} from 'lib/roles'
import { secureRandomAlphanumeric, encryptJson, decryptJson } from 'lib/crypto'

function s3PostData({secret, body, s3Info}){
  const fields = JSON.parse(s3Info.fields),
        data = new FormData(),
        key = s3Info.path + secret,
        url = s3Info.url + "/" + key

  for (let field in fields){
    data.append(field, fields[field])
  }

  data.append('key', key)
  data.append('file', new Blob([body]),{type:'text/plain', filename: secret})
  data.append('Content-Type', 'text/plain')

  return {url, data}
}

function* execS3Post({privkey, pubkey, secret, env, s3Info}){
  const {url, data} = s3PostData({secret, s3Info, body: env}),
        [res, encryptedUrl] = yield [
          s3Client.post(s3Info.url + "/", data),
          call(encryptJson, {data: url, pubkey, privkey})
        ]

  return encryptedUrl
}

function* execUserS3Post(params){
  const {app, environment} = params,
        decryptedEnv = app.envsWithMeta[environment]

  let secret = decryptedEnv["@@__secret__"]

  if (!secret){
    secret = decryptedEnv["@@__secret__"] = secureRandomAlphanumeric(20)
  }

  const encryptedUrl = yield call(execS3Post, {...params, secret})

  return encryptedUrl
}

function* urlSecretForRawEnvKeyable({privkey, s3Info}){
  if (s3Info.decryptedUrlSecret){
    return s3Info.decryptedUrlSecret
  } else if (!s3Info.encryptedUrlSecret) {
    return secureRandomAlphanumeric(20)
  }

  if (!s3Info.urlSecretSignedById){
    debugger
    throw(new Error("encryptedUrlSecret not signed."))
  }

  const signedByUser = yield select(getUser(s3Info.urlSecretSignedById))

  if (!signedByUser){
    throw(new Error("encryptedUrlSecret not signed."))
  }

  const trusted = yield call(keyableIsTrusted, signedByUser)

  if (!trusted){
    throw("encryptedUrlSecret signing user not trusted.")
  }

  const decryptedSecret = yield decryptJson({
    privkey,
    pubkey: signedByUser.pubkey,
    encrypted: s3Info.encryptedUrlSecret
  })

  // Shouldn't be mutating - convert this to redux action
  delete s3Info.encryptedUrlSecret
  delete s3Info.urlSecretSignedById
  s3Info.decryptedUrlSecret = decryptedSecret

  return decryptedSecret
}

function* queueUserS3Uploads({privkey, envParams, updatePaths, requestQueue}){
  if(!envParams.users) return

  for (let userId in envParams.users){
    let apps = envParams.users[userId].apps
    for (let appId in apps){
      let app = yield select(getApp(appId)),
          encryptedEnvsWithMeta = apps[appId].envsWithMeta,
          appUser = yield select(getAppUserBy({userId, appId})),
          user = yield select(getUser(userId)),
          pubkey = user.pubkey

      for (let environment in encryptedEnvsWithMeta){
        let s3Info = appUser.s3UploadInfo[environment]

        if (s3Info){
          let env = encryptedEnvsWithMeta[environment]

          requestQueue.push(call(execUserS3Post, {
            privkey, pubkey, env, s3Info, app, environment
          }))

          updatePaths.push(["users", userId, "apps", appId, "envsWithMeta", environment])
        }
      }
    }
  }
}

function* queueRawEnvKeyableS3Uploads({privkey, envParams, updatePaths, requestQueue}){
  if (envParams.localKeys){
    for (let id in envParams.localKeys){
      let env = envParams.localKeys[id].env,
          localKey = yield select(getLocalKey(id)),
          s3Info = localKey.s3UploadInfo.env,
          pubkey = localKey.pubkey

      if (s3Info){
        requestQueue.push(call(execRawEnvKeyableS3Post, {
          privkey, pubkey, env, s3Info
        }))

        updatePaths.push(["localKeys", id, "env"])
      }
    }
  }

  if (envParams.servers){
    for (let id in envParams.servers){
      let server = yield select(getServer(id)),
          pubkey = server.pubkey

      for (let k of ["env", "inheritanceOverrides"]){
        let env = envParams.servers[id][k],
            s3Info = server.s3UploadInfo[k]

        if (env && s3Info){
          requestQueue.push(call(execRawEnvKeyableS3Post, {
            privkey, pubkey, env, s3Info
          }))

          updatePaths.push(["servers", id, k])
        }
      }
    }
  }
}

export function* execRawEnvKeyableS3Post(params){
  const secret = params.secret || (yield call(urlSecretForRawEnvKeyable, params)),
        encryptedUrl = yield call(execS3Post, {...params, secret})

  return encryptedUrl
}

export function* clearRawEnvKeyableS3Upload(s3UploadInfo){
  const privkey = yield select(getPrivkey),
        promises = []

  for (let s3Key in s3UploadInfo){
    let s3Info = s3UploadInfo[s3Key],
        secret = yield call(urlSecretForRawEnvKeyable, {privkey, s3Info}),
        {url, data} = s3PostData({
          secret,
          s3Info,
          body: ""
        })
    promises.push(s3Client.post(s3Info.url + "/", data))
  }

  yield promises
}

export function* clearAppUserLocalKeyS3Uploads(appUserId){
  const localKeys = yield select(getLocalKeysWithPubkeyForAppUser(appUserId))
  yield localKeys.map(({s3UploadInfo})=> call(clearRawEnvKeyableS3Upload, s3UploadInfo))
}

export function* clearAppUserS3Uploads({appId, userId}){
  const app = yield select(getApp(appId)),
        appUser = yield select(getAppUserBy({appId, userId})),
        envsWithMeta = app.envsWithMeta,
        {id: appUserId, s3UploadInfo} = appUser

  const promises = []

  for (let environment in s3UploadInfo){
    const s3Info = s3UploadInfo[environment],
          {url, data} = s3PostData({
            s3Info,
            secret: R.path([environment, "@@__secret__"], envsWithMeta),
            body: ""
          })

    promises.push(s3Client.post(s3Info.url + "/", data))
  }

  promises.push(call(clearAppUserLocalKeyS3Uploads, appUserId))

  yield promises
}

export function* clearAppServerS3Uploads(appId){
  const servers = yield select(getServersWithPubkeyForApp(appId))
  yield servers.map(({s3UploadInfo})=> call(clearRawEnvKeyableS3Upload, s3UploadInfo))
}

export function* clearAppS3Uploads(appId){
  const users = yield select(getUsersForApp(appId)),
        appUserPromises = R.pipe(
          R.map(R.prop('relation')),
          R.map(R.partial(call, [clearAppUserS3Uploads])),
          R.flatten
        )(users),
        serverPromise = call(clearAppServerS3Uploads, appId),
        allPromises = appUserPromises.concat([serverPromise])

  yield allPromises
}

export function* clearUserS3Uploads(userId){
  const apps = yield select(getAppsForUser(userId)),
        appUserPromises = R.pipe(
          R.map(R.prop('relation')),
          R.map(R.partial(call, [clearAppUserS3Uploads])),
          R.flatten
        )(apps)

  yield appUserPromises
}

export function* clearAllS3Uploads(){
  const apps = yield select(getApps),
        promises = apps.map(R.pipe(
          R.prop('id'),
          R.partial(call, [clearAppS3Uploads])
        ))

  yield promises
}

export function* processS3Uploads(envParams){
  const updatePaths = [],
        requestQueue = [],
        privkey = yield select(getPrivkey)

  yield call(queueUserS3Uploads, {privkey, envParams, updatePaths, requestQueue})
  yield call(queueRawEnvKeyableS3Uploads, {privkey, envParams, updatePaths, requestQueue})

  const encryptedUrls = yield requestQueue

  for (let i = 0; i < encryptedUrls.length; i++){
    let encryptedUrl = encryptedUrls[i],
        updatePath = updatePaths[i]

    envParams = R.assocPath(updatePath, encryptedUrl, envParams)
  }

  return envParams
}

export function *createUrlPointer({keyableType, target}){
  return {
    urlSecret: secureRandomAlphanumeric(20),
    inheritanceOverridesUrlSecret: (
      (keyableType == "server" && target.role == "production") ?
        secureRandomAlphanumeric(20) :
        undefined
    )
  }
}

function *encryptUrlSecrets({urlPointer, privkey, pubkey}){
  // if urlSecret isn't a string, it's a promise to decrypt the encrypted secret (or just return it if already decrypted)
  if (typeof urlPointer.urlSecret != "string"){
    urlPointer.urlSecret = yield urlPointer.urlSecret
  }

  if (typeof urlPointer.inheritanceOverridesUrlSecret != "string"){
    urlPointer.inheritanceOverridesUrlSecret = yield urlPointer.inheritanceOverridesUrlSecret
  }

  const toEncrypt = [encryptJson({data: urlPointer.urlSecret, privkey, pubkey})]
  if (urlPointer.inheritanceOverridesUrlSecret){
    toEncrypt.push(encryptJson({data: urlPointer.inheritanceOverridesUrlSecret, privkey, pubkey}))
  }

  const [encryptedUrlSecret, encryptedInheritanceOverridesUrlSecret] = yield toEncrypt

  return {encryptedUrlSecret, encryptedInheritanceOverridesUrlSecret}
}

export function *urlPointersForRawEnvKeyable({appId, keyableType, keyableId, urlPointer}){
  const users = yield select(getUsersForApp(appId)),
        privkey = yield select(getPrivkey),
        encryptQueue = [],
        updatePaths = []

  for (let {pubkey, id: userId} of users){
    encryptQueue.push(call(encryptUrlSecrets, {urlPointer, privkey, pubkey}))
    updatePaths.push([pluralize(keyableType), keyableId, [userId, appId].join("|")])
  }

  const allEncrypted = yield encryptQueue

  return allEncrypted.reduce((agg, enc, i) => {
    return R.assocPath(updatePaths[i], enc, agg)
  }, {})
}

export function *urlPointersForAppUser({appId, userId}){
  const privkey = yield select(getPrivkey),
        servers = yield select(getServersWithPubkeyForApp(appId)),
        localKeys = yield select(getLocalKeysWithPubkeyForApp(appId)),
        keyables = servers.concat(localKeys),
        encryptQueue = [],
        updatePaths = []

  for (let [keyables, keyableType] of [[servers, "server"], [localKeys, "localKeys"]]){
    for (let {id: keyableId, pubkey, s3UploadInfo} of keyables){
      let urlSecret = call(urlSecretForRawEnvKeyable, {privkey, s3Info: s3UploadInfo.env}),
          inheritanceOverridesUrlSecret

      if (s3UploadInfo.inheritanceOverrides){
        inheritanceOverridesUrlSecret = call(urlSecretForRawEnvKeyable, {privkey, s3Info: s3UploadInfo.inheritanceOverrides})
      }

      encryptQueue.push(call(encryptUrlSecrets, {
        urlPointer: {urlSecret, inheritanceOverridesUrlSecret},
        privkey,
        pubkey
      }))

      updatePaths.push([pluralize(keyableType), keyableId, [userId, appId].join("|")])
    }
  }

  const allEncrypted = yield encryptQueue

  return allEncrypted.reduce((agg, enc, i) => {
    return R.assocPath(updatePaths[i], enc, agg)
  }, {})
}

export function *urlPointersForUpdateOrgRole({userId, role: newRole}){
  const {orgRole: currentRole} = yield select(getUser(userId)),

        isCurrentAdmin = orgRoleIsAdmin(currentRole),

        isUpdatingToAdmin = orgRoleIsAdmin(newRole),

        isUpdatingNonAdminToAdmin = !isCurrentAdmin && isUpdatingToAdmin

  if (!isUpdatingNonAdminToAdmin) return {}

  const apps = yield select(getApps),
        generators = apps.map(({id: appId})=> call(urlPointersForAppUser, {userId, appId})),
        allParams = yield generators

  return allParams.reduce(R.mergeDeepRight)
}

export function *urlPointersForInvitee({userId, permittedAppIds}){
  const generators = permittedAppIds.map(appId => call(urlPointersForAppUser, {userId, appId})),
        allParams = yield generators

  return allParams.reduce(R.mergeDeepRight)
}

export function *urlPointersForOrgStorageUpdate(){
  const generators = [],
        apps = yield select(getApps)

  for (let {id: appId} of apps){
    let users = yield select(getUsersForApp(appId))

    for (let {id: userId} of users){
      generators.push(call(urlPointersForAppUser, {userId, appId}))
    }
  }

  const allParams = yield generators
  return allParams.reduce(R.mergeDeepRight)
}


