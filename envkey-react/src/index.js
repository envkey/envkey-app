import 'babel-polyfill'
import React from "react"
import ReactDOM from "react-dom"
import Routes from 'routes'
import R from 'ramda'
import * as crypto from 'lib/crypto'
// import {misc} from 'sjcl'

ReactDOM.render(<Routes />, document.getElementById('react-root'))

crypto.init()

// crypto.generateKeys({id: "test-id", passphrase: "password"}).then((key) => {
//   const encryptedPrivkey = key.privateKeyArmored,
//         pubkey = key.publicKeyArmored

//   crypto.encryptJson({data: {msg: "Hello world!"}, pubkey}).then(encrypted => {

//     crypto.decryptPrivateKey({privkey: encryptedPrivkey, passphrase: "password"}).then(privkey => {
//       crypto.decryptJson({
//         encrypted,
//         privkey
//       }).then(data => {
//         console.log(JSON.stringify(data))
//       })
//     })

//   })

// })



