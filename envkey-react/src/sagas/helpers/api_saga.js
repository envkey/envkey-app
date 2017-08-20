import {delay} from 'redux-saga'
import { call, select, put } from 'redux-saga/effects'
import R from 'ramda'
import {flattenObj} from 'lib/utils/object'
import {decamelizeKeys} from 'xcase'
import {
  TOKEN_INVALID,
  ORG_INVALID,
  API_SUCCESS,
  API_FAILED
} from 'actions'
import {getAuth, getCurrentOrgSlug} from "selectors"
import api, { authenticatedClient } from "lib/api"

export default function apiSaga({
  authenticated,
  actionTypes,
  method,
  urlSelector,
  skipOrg,
  urlFn,
  minDelay,
  debounce
}){

  if (typeof authenticated !== 'boolean'){
    throw new Error('authenticated: Expected a boolean.')
  }

  if (!Array.isArray(actionTypes) ||
      actionTypes.length !== 2 ||
      !actionTypes.every(type => typeof type === 'string')) {
    throw new Error('actionTypes: Expected an array of two string actionTypes, for success and failure conditions.')
  }

  if (["get", "post", "patch", "put", "delete"].indexOf(method) == -1){
    throw new Error('method: Requires a valid REST method: get, post, patch, put, or delete.')
  }

  if (typeof urlFn !== 'function') {
    throw new Error('urlFn: Expected to be a function.')
  }

  if (!(typeof urlSelector === 'function' ||
        typeof urlSelector === 'undefined')) {
    throw new Error('urlSelector: Expected to be either undefined or a function.')
  }

  const [SUCCESS_TYPE, FAILURE_TYPE] = actionTypes

  return function* (requestAction){
    if(debounce && debounce > 0){
      yield call(delay, debounce)
    }

    // ensure no form of 'password' or 'passphrase' is ever present on an api call
    if (requestAction.payload && requestAction.payload.constructor == Object){
      const hasPasswordKey = R.pipe(
        flattenObj,
        R.keys,
        R.any(k => k.toLowerCase().indexOf("password") > -1 || k.toLowerCase().indexOf("passphrase") > -1)
      )(requestAction.payload)

      if (hasPasswordKey){
        throw new Error('Included password/passphrase in API request payload.')
      }
    }

    const auth = yield select(getAuth),
          orgSlug = R.path(["meta", "orgSlug"], requestAction) || (yield select(getCurrentOrgSlug)),
          client = authenticated ? authenticatedClient(auth) : api,
          urlArg = urlSelector ? (yield select(urlSelector)) : null,
          url = urlFn(requestAction, urlArg),
          orgParams = skipOrg ? {} : {org_id: orgSlug},
          decamelizedPayload = decamelizeKeys(requestAction.payload || {}),
          params = method == "get" ? {...orgParams, ...decamelizedPayload} : orgParams,
          data = method == "get" ? {} : decamelizedPayload,
          config = {method, url, params, data}

    try {
      const [res] = (minDelay && !R.path(["meta", "skipDelay"], requestAction)) ?
              yield [ call(client, config), call(delay, minDelay) ] :
              yield [ call(client, config) ]

      yield put({type: API_SUCCESS})

      yield put({
        type: SUCCESS_TYPE,
        payload: res.data,
        meta: {
          ...requestAction.meta,
          headers: res.headers,
          status: res.status,
          requestPayload: requestAction.payload
        }
      })

    } catch (err){
      const status = R.path(["response", "status"], err),
            msg = R.path(["response", "data", "error"], err),
            payload = err,
            meta = {...requestAction.meta, status, requestPayload: requestAction.payload, message: msg}

      if (status){

        yield put({type: API_FAILED})

        yield put({type: FAILURE_TYPE, error: true, payload, meta})

        if (authenticated){
          if (status == 401){
            yield put({type: TOKEN_INVALID, error: true, payload, meta})
          } else if (status == 404 && msg == "Missing org"){
            yield put({type: ORG_INVALID, error: true, payload, meta})
          }
        }

      } else {
        throw(err)
      }

    }

  }
}

