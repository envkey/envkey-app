import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'

export default function({
  label,
  isRemoving,
  onRemove,
}){

  const renderButton = ()=> {
    if(isRemoving){
      return h(SmallLoader)
    } else {
      return h.button({onClick: onRemove}, `Delete ${label}`)
    }
  }

  return h.div(".delete-field", [
    renderButton()
  ])
}