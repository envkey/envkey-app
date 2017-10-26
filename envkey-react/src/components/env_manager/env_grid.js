import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import EnvGridContent from './env_grid_content'
import LabelRow from './label_row'
import EntryForm from './entry_form'

export default function(props) {
  const renderAddVar = ()=>{
    if(!props.isReadOnly){
      return h(EntryForm, {
        ...props,
        onSubmit: props.createEntry
      })
    }
  }

  return h.div(".grid.env-grid", [
    (props.subEnvId ? null : h(LabelRow, props)),
    renderAddVar(),
    h(EnvGridContent, props)
  ])
}

