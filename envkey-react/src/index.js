import 'babel-polyfill'
import React from "react"
import ReactDOM from "react-dom"
import Routes from 'routes'
import R from 'ramda'
import {startConnectionWatcher, startReactivatedWatcher, startWindowFocusWatcher} from 'lib/status'

ReactDOM.render(<Routes />, document.getElementById('wrap'))
document.body.className += " react-loaded"
startConnectionWatcher()
startReactivatedWatcher()

