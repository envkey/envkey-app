import 'babel-polyfill'
import React from "react"
import ReactDOM from "react-dom"
import Routes from 'routes'
import R from 'ramda'
import * as crypto from 'lib/crypto'

ReactDOM.render(<Routes />, document.getElementById('react-root'))

crypto.init()