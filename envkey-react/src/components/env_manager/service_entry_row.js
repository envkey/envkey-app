import React from 'react'
import ServiceEntryCell from './env_cell/service_entry_cell'
import ServiceValCell from './env_cell/service_val_cell'
import h from "lib/ui/hyperscript_with_helpers"

export default function(props) {
  const {entryKey, service, environments} = props
  return h.div(".row.entry-row", [
    h.div(".entry-col",[
      h(ServiceEntryCell, {
        ...props,
        val: entryKey.toUpperCase()
      })
    ]),

    h.div(".val-cols", [
      environments.map((environment,i)=>{
        const envEntry = service.envsWithMeta[environment][entryKey]
        return h.div(".val-col", {key: i}, [
          h(ServiceValCell, {
            ...props,
            ...envEntry,
            envsWithMeta: service.envsWithMeta,
            environment
          })
        ])
      })
    ])

  ])
}

