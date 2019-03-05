import 'babel-polyfill'
import React from "react"
import ReactDOM from "react-dom"
import Routes from 'routes'
import {startConnectionWatcher, startReactivatedWatcher} from 'lib/status'

ReactDOM.render(<Routes />, document.getElementById('wrap'))
document.body.className += " react-loaded"
startConnectionWatcher()
startReactivatedWatcher()

// window.shell.openExternal(
//   `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_OAUTH_CLIENT_ID}&scope=user:email`
// )
