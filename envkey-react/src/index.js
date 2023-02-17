import 'babel-polyfill'
import React from "react"
import ReactDOM from "react-dom"
import Routes from 'routes'
import R from 'ramda'
import * as crypto from 'lib/crypto'
import {
  startConnectionWatcher,
  startReactivatedWatcher
} from 'lib/status'

ReactDOM.render(<Routes />, document.getElementById('wrap'))

crypto.init()

document.body.className += " react-loaded"

startConnectionWatcher()
startReactivatedWatcher()
