import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import AssocColumn from "./assoc_column"
import DecryptForm from 'components/shared/decrypt_form'
import DecryptLoader from 'components/shared/decrypt_loader'
import {AwaitingAccessContainer} from 'containers'

export default function(props) {
  const
    {columnsConfig} = props,

    renderColumns = ()=> columnsConfig.columns.map((config, i) => {
      const hideWhenFn = config.hideWhenFn
      if(!(hideWhenFn && hideWhenFn))
      return h(AssocColumn, {
        ...props,
        config,
        key: i,
        rowDisplayType: columnsConfig.rowDisplayType
      })
    }),

    renderContents = ()=> {
      if (!props.envAccessGranted){
        return [h(AwaitingAccessContainer)]
      } else if(props.envsAreDecrypted || props.isDecrypting){
        return [
          renderColumns().concat([
            h(DecryptLoader, props)]
          )
        ]
      }  else {
        return [h(DecryptForm, {onSubmit: props.decrypt})]
      }
    }

  return h.div(".association-manager",
    {className: `${props.parentType}-${props.assocType}`},
    renderContents()
  )
}