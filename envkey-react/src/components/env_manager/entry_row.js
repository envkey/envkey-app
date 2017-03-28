import React from 'react'
import EnvEntryCell from './env_cell/env_entry_cell'
import EnvValCell from './env_cell/env_val_cell'

import h from "lib/ui/hyperscript_with_helpers"

export default function(props) {
  const {entryKey, envsWithMeta, environments, editing, highlightRow} = props
  return h.div(".row.entry-row", {
    className: (highlightRow ? "highlight-row" : "")
  }, [
    h.div(".entry-col",[
      h(EnvEntryCell, {
        ...props,
        val: entryKey.toUpperCase(),
        isUpdating: props.isUpdatingEntryFn(entryKey),
        isEditing: editing.entryKey === entryKey && !editing.environment
      })
    ]),

    h.div(".val-cols", [
      environments.map((environment,i)=>{
        const envEntry = envsWithMeta[environment][entryKey]
        return h.div(".val-col", {key: i}, [
          h(EnvValCell, {
            ...props,
            ...envEntry,  //for 'val' and 'inherits'
            environment,
            isUpdating: props.isUpdatingValFn(entryKey, environment),
            isEditing: editing.entryKey === entryKey && editing.environment === environment
          })
        ])
      })
    ])

  ])
}

