import R from 'ramda'
import { getPubkeyFingerprint } from '../crypto'
import { TRUSTED_PUBKEY_PROPS } from 'constants'

export const keyableIsTrusted = (keyable, trustedPubkeys)=>{
  console.log(`keyableIsTrusted: checking keyable: ${keyable.id}`)

  const {id: keyableId, pubkey, invitePubkey} = keyable,
        trusted = R.prop(keyableId, trustedPubkeys)

  if (!(pubkey || invitePubkey)){
    console.log("keyableIsTrusted: Missing either pubkey or invitePubkey. Not trusted.")
    return false
  }

  if (!trusted){
    console.log("keyableIsTrusted: Not trusted.")
    return false
  }

  if((pubkey && !trusted.pubkeyFingerprint) || (invitePubkey && !trusted.invitePubkeyFingerprint)){
    console.log("keyableIsTrusted: Trusted keyable is missing either pubkeyFingerprint or invitePubkeyFingerprint.")
    return false
  }

  const keyableProps = R.pick(TRUSTED_PUBKEY_PROPS, keyable),
        trustedProps = R.pick(TRUSTED_PUBKEY_PROPS, trusted)

  if (!R.equals(keyableProps, trustedProps)){
    console.log("keyableIsTrusted: keyable props do not match trusted keyable props.")
    return false
  }

  if(pubkey && getPubkeyFingerprint(pubkey) != trusted.pubkeyFingerprint){
    console.log("keyableIsTrusted: pubkeyFingerprint does not match pubkey")
    return false
  }

  if(invitePubkey && getPubkeyFingerprint(invitePubkey) != trusted.invitePubkeyFingerprint){
    console.log("keyableIsTrusted: invitePubkeyFingerprint does not match invitePubkey")
    return false
  }

  console.log(`keyableIsTrusted: ${keyable.id} is trusted.`)

  return true
}