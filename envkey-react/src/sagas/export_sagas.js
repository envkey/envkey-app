import R from 'ramda'
import { takeEvery, select } from 'redux-saga/effects'
import {
  getApp,
  getRawEnvWithPendingForApp
} from 'selectors'
import {
  EXPORT_ENVIRONMENT
} from "actions"
import {rawEnvToTxt} from "envkey-client-core/dist/lib/parse"
import isElectron from 'is-electron'

function* onExportEnvironment({meta: {parentId}, payload: {environment, format}}){
  const app = yield select(getApp(parentId)),
        rawEnv = yield select(getRawEnvWithPendingForApp({appId: parentId, environment, subEnvId}))

  if (isElectron()){
    window.dialog.showSaveDialog({
      title: `Export ${app.name} - ${environment}`,
      defaultPath: `${subEnvName || environment}.${format}`
    }, (filename)=> {
      if(!filename)return
      window.fs.writeFile(filename, rawEnvToTxt(rawEnv, format), (err) => {
        if(err){
          alert("An error ocurred saving the file "+ err.message)
        }
      })
    })

  }
}

export default function* exportSagas(){
  yield [
    takeEvery(EXPORT_ENVIRONMENT, onExportEnvironment)
  ]
}
