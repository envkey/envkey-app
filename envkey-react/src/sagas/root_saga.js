import { fork } from 'redux-saga/effects'

const
  coreSagaPaths = [
    "auth",
    "assoc",
    "env",
    "object"
    "org",
    "crypto",
    "import",
    "invite"
  ].map(s => `envkey-client-core/sagas/${s}_sagas`),

  uiSagaPaths = [
    "auth",
    "env",
    "object",
    "org",
    "socket",
    "import",
    "invite",
    "billing",
    "export"
  ].map(s => `./${s}_sagas`),

  allSagaPaths = coreSagaPaths.concat(uiSagaPaths)

export default function* rootSaga(){
  yield allSagaPaths.map(path => fork(require(path).default))
}