import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import DecryptForm from 'components/shared/decrypt_form'
import DecryptLoader from 'components/shared/decrypt_loader'
import DevKeyRow from './assoc_row/dev_key_row'
import {AwaitingAccessContainer} from 'containers'

export default function(props) {

  const renderContents = ()=>{
    if (!props.envAccessGranted){
      return [h(AwaitingAccessContainer)]
    } else if(props.envsAreDecrypted || props.isDecrypting){
      return [h(DevKeyRow, props), h(DecryptLoader, props)]
    } else {
      return [h(DecryptForm, {onSubmit: props.decrypt})]
    }
  }

  return h.div(".dev-key-manager", renderContents())
}