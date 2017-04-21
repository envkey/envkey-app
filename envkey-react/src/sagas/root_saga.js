import { fork } from 'redux-saga/effects'

const sagaFiles = [
  "auth",
  "assoc",
  "env",
  "object",
  "org",
  "socket",
  "crypto",
  "import"
]

export default function* rootSaga(){
  yield sagaFiles.map(path => fork(require(`./${path}_sagas`).default))
}