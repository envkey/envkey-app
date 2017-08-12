import bs58 from 'bs58'
import sjcl from 'sjcl'

let currentProxy = 0
const
  workerPath = `${process.env.ASSET_HOST}/openpgp.worker.min.js`,
  concurrency = (navigator.hardwareConcurrency || 4) - 1,
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

  pgpUserIdFromEmail = email => {
    const id = sha256(email + "envkey-pgp-v1")
    return {name: id, email: `${id}@envkey.com`}
  },

  sha256 = s => sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(s)),

  emailSalt = (email)=> sha256(email + "envkey-salt-of-pure-basalt"),

  hashedPassword = (email, password, tries=100000)=> {
    return sjcl.codec.hex.fromBits(
      sjcl.misc.pbkdf2(password, emailSalt(email), tries)
    )
  },

  generateKeys = ({email, passphrase}, worker=false)=>{
    const opts = {
      userIds: [pgpUserIdFromEmail(email)],
      numBits: 2048,
      passphrase
    }

    return worker ? proxy().delegate('generateKey', opts) : openpgp.generateKey(opts)
  },

  getHKPServer = ()=> new openpgp.HKP('https://pgp.mit.edu'),

  uploadPublicKeyToKeyserver = pubkey => {
    const hkp = getHKPServer()
    return hkp.upload(pubkey)
  },

  lookupPublicKeyFromKeyserver = email =>{
    const hkp = getHKPServer(),
          opts = {query: pgpUserIdFromEmail(email).name}

    return hkp.lookup(opts)
  },

  getPubkeyFingerprint = pubkey => openpgp.key.readArmored(pubkey).keys[0].primaryKey.fingerprint,

  encryptJson = ({data, pubkey, privkey=null})=>{
    const opts = {
      data: JSON.stringify(data),
      publicKeys: openpgp.key.readArmored(pubkey).keys,
      privateKeys: (privkey ? openpgp.key.readArmored(privkey).keys : undefined)
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

  signCleartextJson = ({data, privkey})=>{
    const opts = {
      data: JSON.stringify(data),
      privateKeys: openpgp.key.readArmored(privkey).keys
    }

    return proxy().delegate('sign', opts).then(({data})=> data)
  },

  verifyCleartextJson = ({signed, pubkey})=>{
    const opts = {
      message: openpgp.cleartext.readArmored(signed),
      publicKeys: openpgp.key.readArmored(pubkey).keys
    }

    return proxy().delegate('verify', opts).then(({data})=> JSON.parse(data))
  },

  decryptPrivateKey = ({privkey, passphrase})=>{
    return proxy().delegate('decryptKey', {
      privateKey: openpgp.key.readArmored(privkey).keys[0],
      passphrase
    }).then(({key}) => key.armor())
  },

  signPublicKey = ({privkey: privkeyArmored, pubkey: pubkeyArmored})=>{
    const pubkey = openpgp.key.readArmored(pubkeyArmored).keys[0],
          privkey = openpgp.key.readArmored(privkeyArmored).keys[0]

    return pubkey.signPrimaryUser([privkey]).armor()
  },

  verifyPublicKeySignature = ({signedKey: signedKeyArmored, signerKey: signerKeyArmored})=>{
    const signedKey = openpgp.key.readArmored(signedKeyArmored).keys[0],
          signerKey = openpgp.key.readArmored(signerKeyArmored).keys[0],
          signatures = signedKey.verifyPrimaryUser([signerKey])

    return signatures[0].valid === null &&
           signatures[0].keyid.toHex() == signedKey.primaryKey.getKeyId().toHex() &&
           signatures[1].valid === true &&
           signatures[1].keyid.toHex() == signerKey.primaryKey.getKeyId().toHex()

  }