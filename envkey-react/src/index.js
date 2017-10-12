import 'babel-polyfill'
import React from "react"
import ReactDOM from "react-dom"
import Routes from 'routes'
import R from 'ramda'
import * as crypto from 'lib/crypto'
import {startConnectionWatcher, startReactivatedWatcher, startWindowFocusWatcher} from 'lib/status'
import {listenUpdater} from 'lib/updates'

ReactDOM.render(<Routes />, document.getElementById('wrap'))

crypto.init()

document.body.className += " react-loaded"

const devMode = process.env.NODE_ENV == "development" || process.env.BUILD_ENV == "staging"

if(process.env.NODE_ENV != "development"){
  startConnectionWatcher()
  listenUpdater()
  startReactivatedWatcher()
}



