import bs58 from 'bs58'
import sjcl from 'sjcl'

let currentProxy = 0
const
  workerPath = '/openpgp.worker.min.js',
  concurrency = navigator.hardwareConcurrency - 1 || 3,
  proxyPool = [],

  initProxyPool = ()=>{
    let i = 0
    while (i < concurrency){
      proxyPool.push(new openpgp.AsyncProxy({path: workerPath, config: openpgp.config}))
      i++
    }
  },

  proxy = ()=>{
    let i = currentProxy

    if(currentProxy == proxyPool.length - 1){
      currentProxy = 0
    } else {
      currentProxy++
    }

    return proxyPool[i]
  }

export const

  init = ()=>{
    openpgp.config.aead_protect = false
    openpgp.config.use_native = true

    openpgp.initWorker({path: workerPath})
    initProxyPool()
  },

  secureRandomAlphanumeric = (len)=> {
    return bs58.encode(
      openpgp.crypto.random.getRandomBytes(
        Math.ceil(len * 0.75)
      )
    ).slice(0,len)
  },

  emailHash = (email)=> sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(email)),

  emailSalt = (email)=> emailHash(email + "envkey-salt-of-pure-basalt"),

  hashedPassword = (email, password)=> sjcl.codec.hex.fromBits(
    sjcl.misc.pbkdf2(password, emailSalt(email), 50000)
  ),

  generateKeys = ({id, passphrase})=>{
    const opts = {
      userIds: [{ name: id, email:`${id}@envkey.com` }],
      numBits: 2048,
      passphrase
    }

    return openpgp.generateKey(opts)
  },

  encryptJson = ({data, pubkey})=>{
    const opts = {
      data: JSON.stringify(data),
      publicKeys: openpgp.key.readArmored(pubkey).keys
    }
    return proxy().delegate('encrypt', opts).then(({data})=> data)
  },

  decryptJson = ({encrypted, privkey, pubkey=null})=>{
    const opts = {
            message: openpgp.message.readArmored(encrypted),
            privateKey: openpgp.key.readArmored(privkey).keys[0],
            publicKeys: (pubkey ? openpgp.key.readArmored(pubkey).keys : undefined)
          }

    return proxy().delegate('decrypt', opts).then(({data})=> JSON.parse(data))
  },

  decryptPrivateKey = ({privkey, passphrase})=>{
    return proxy().delegate('decryptKey', {
      privateKey: openpgp.key.readArmored(privkey).keys[0],
      passphrase
    }).then(({key}) => key.armor())
  }