import { fork } from 'redux-saga/effects'

const sagaPaths = [
  "auth",
  "assoc",
  "env",
  "object",
  "org"
]

export default function* rootSaga(){
  yield sagaPaths.map(path => fork(require(`./${path}_sagas`).default))
}