// Dirtily replaces all keys, encrypted data, and web of trust in the state with client-generated placeholders for debugging purposes.
// Should be run with console after org data is loaded but before decryption

import R from 'ramda'
import {store} from 'init_redux'
import * as crypto from 'lib/crypto'
import {
  getServers,
  getLocalKeys
} from 'selectors'

const
  configReplacement = {
    KEY: {val: "val", inherits: null},
    KEY_2: {val: "val2", inherits: null}
  },

  passphrase = "passphrase"

function run(gf) {
  let g = gf();
  return Promise.resolve(function step(v) {
       var res = g.next(v);
       if (res.done) return res.value;
       return res.value.then(step);
  }());
}

function *replaceCrypto(){

  const state = store.getState()

  // replace encryptedPrivkey
  // replace user keys
  const keypairsById = {},
        trustedPubkeys = {}

  let currentUserPrivkey,
      currentUserPubkey

  for (let id in state.users){
    let user = state.users[id]

    console.log("Generating keys for user: ")
    console.log(user)

    let {
      privateKeyArmored: encryptedPrivkey,
      publicKeyArmored: unsignedPubkey
    } = yield crypto.generateKeys({email: user.email, passphrase})

    console.log("Keys generated.")
    console.log("Decrypting privkey.")

    let privkey = yield crypto.decryptPrivateKey({privkey: encryptedPrivkey, passphrase})

    console.log("Privkey decrypted.")
    console.log("Generating invite keys.")

    let {
      privateKeyArmored: inviteEncryptedPrivkey,
      publicKeyArmored: invitePubkey
    } = yield crypto.generateKeys({email: "invite-" + user.email, passphrase})

    console.log("Invite keys generated.")
    console.log("Decrypting invite privkey.")

    let invitePrivkey = yield crypto.decryptPrivateKey({privkey: inviteEncryptedPrivkey, passphrase})

    console.log("Invite privkey decrypted.")


    let pubkey
    if (user.invitedById){
      console.log("Signing pubkey with invite privkey.")
      pubkey = crypto.signPublicKey({privkey: invitePrivkey, pubkey: unsignedPubkey})
      console.log("Signed pubkey.")
    } else {
      console.log("Org owner doesn't need signed pubkey.")
      pubkey = unsignedPubkey
    }

    keypairsById[id] = {
      encryptedPrivkey,
      privkey,
      pubkey,
      invitePubkey,
      invitePrivkey
    }

    if(user.isCurrentUser){
      currentUserPrivkey = privkey
      currentUserPubkey = pubkey
      state.encryptedPrivkey = encryptedPrivkey
    }
  }

  // User web of trust
  for (let id in state.users){
    let user = state.users[id],
        {invitePubkey, pubkey} = keypairsById[id],
        signedInvitePubkey

    console.log("Signing invite key for user: ")
    console.log(user)

    if (user.invitedById){
      let signerPrivkey = keypairsById[user.invitedById].privkey
      signedInvitePubkey = crypto.signPublicKey({privkey: signerPrivkey, pubkey: invitePubkey})
    }

    let fp = crypto.getPubkeyFingerprint(pubkey)
    user.pubkey = pubkey
    user.pubkeyFingerprint = fp

    if (signedInvitePubkey){
      let inviteFp = crypto.getPubkeyFingerprint(signedInvitePubkey)
      user.invitePubkey = signedInvitePubkey
      user.invitePubkeyFingerprint = inviteFp
    }

    trustedPubkeys[user.id] = R.pick(["pubkeyFingerprint", "invitePubkeyFingerprint", "invitedById"], user)
  }

  // Server / LocalKey web of trust
  for (let t of ["localKeys", "servers"]){
    for (let keyableId in state[t]){
      let keyable = state[t][keyableId]
      if(!keyable.pubkey)continue

      console.log("Signing pubkey for keyable: ")
      console.log(keyable)

      let {
        privateKeyArmored: encryptedPrivkey,
        publicKeyArmored: unsignedPubkey
      } = yield crypto.generateKeys({email: keyable.id + "@envkey.com", passphrase})

      let privkey = yield crypto.decryptPrivateKey({privkey: encryptedPrivkey, passphrase}),
          signerPrivkey = keypairsById[keyable.keyGeneratedById].privkey,
          pubkey = crypto.signPublicKey({privkey: signerPrivkey, pubkey: unsignedPubkey})

      keyable.pubkey = pubkey
      keyable.pubkeyFingerprint = crypto.getPubkeyFingerprint(pubkey)

      trustedPubkeys[keyable.id] = R.pick(["pubkeyFingerprint", "keyGeneratedById"], keyable)
    }
  }

  // replace signedTrustedPubkeys
  console.log("Replacing signedTrustedPubkeys")
  state.signedTrustedPubkeys = yield crypto.signCleartextJson({
    data: trustedPubkeys,
    privkey: currentUserPrivkey
  })

  // replace encrypted app config
  console.log("Replacing app config")
  for (let id in state.apps){
    let app = state.apps[id]

    console.log("Replacing for app: ")
    console.log(app)

    for (let env in app.encryptedEnvsWithMeta){
      console.log(env)
      let cipher = app.encryptedEnvsWithMeta[env]
      if(!R.isEmpty(cipher)){
        let signedById = app.envsSignedBy[env],
            {privkey} = keypairsById[signedById],
            pubkey = currentUserPubkey,
            replacement = yield crypto.encryptJson({ data: configReplacement, privkey, pubkey })

        app.encryptedEnvsWithMeta[env] = replacement
      }
    }
  }

  return state
}


window.debugCrypto = ()=> {
  run(replaceCrypto).then(console.log, console.error)
}
