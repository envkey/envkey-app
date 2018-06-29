import R from 'ramda'
import { takeEvery, select } from 'redux-saga/effects'
import {
  getApp,
  getRawEnvWithPendingForApp
} from 'selectors'
import {
  EXPORT_ENVIRONMENT
} from "actions"
import {toYaml, toDotEnv} from 'lib/parse'
import isElectron from 'is-electron'

const rawEnvToTxt = (rawEnv, format)=> {
  let txt
  if (format == "json"){
    txt = JSON.stringify(rawEnv, null, 2)
  } else if (format == "yaml"){
    txt = toYaml(rawEnv)
  } else if (format == "env"){
    txt = toDotEnv(rawEnv)
  }
  return txt
}

function* onExportEnvironment({meta: {parentId}, payload: {environment, format, subEnvId, subEnvName}}){
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

export default function* importSagas(){
  yield [
    takeEvery(EXPORT_ENVIRONMENT, onExportEnvironment)
  ]
}
