import { fork } from 'redux-saga/effects'

import coreAuthSagas from 'envkey-client-core/dist/sagas/auth_sagas'
import coreAssocSagas from 'envkey-client-core/dist/sagas/assoc_sagas'
import coreEnvSagas from 'envkey-client-core/dist/sagas/env_sagas'
import coreObjectSagas from 'envkey-client-core/dist/sagas/object_sagas'
import coreOrgSagas from 'envkey-client-core/dist/sagas/org_sagas'
import coreCryptoSagas from 'envkey-client-core/dist/sagas/crypto_sagas'
import coreImportSagas from 'envkey-client-core/dist/sagas/import_sagas'
import coreInviteSagas from 'envkey-client-core/dist/sagas/invite_sagas'

import authSagas from "sagas/auth_sagas"
import envSagas from "sagas/env_sagas"
import objectSagas from "sagas/object_sagas"
import orgSagas from "sagas/org_sagas"
import socketSagas from "sagas/socket_sagas"
import importSaga from "sagas/import_sagas"
import inviteSagas from "sagas/invite_sagas"
import exportSagas from "sagas/export_sagas"

const allSagas = [
  coreAuthSagas,
  coreAssocSagas,
  coreEnvSagas,
  coreObjectSagas,
  coreOrgSagas,
  coreCryptoSagas,
  coreImportSagas,
  coreInviteSagas,
  authSagas,
  envSagas,
  objectSagas,
  orgSagas,
  socketSagas,
  importSaga,
  inviteSagas,
  exportSagas
]

export default function* rootSaga(){
  yield allSagas.map(saga => fork(saga))
}