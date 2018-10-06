import React from 'react'
import ConfigBlockEntryCell from './env_cell/config_block_entry_cell'
import ConfigBlockValCell from './env_cell/config_block_val_cell'
import h from "lib/ui/hyperscript_with_helpers"

export default function(props) {
  const {entryKey, block, environments} = props
  return h.div(".row.entry-row", [
    h.div(".entry-col",[
      h(ConfigBlockEntryCell, {
        ...props,
        val: entryKey.toUpperCase()
      })
    ]),

    h.div(".val-cols", [
      environments.map((environment,i)=>{
        const envEntry = block.envsWithMeta[environment][entryKey]
        return h.div(".val-col", {key: i}, [
          h(ConfigBlockValCell, {
            ...props,
            ...envEntry,
            envsWithMeta: block.envsWithMeta,
            environment
          })
        ])
      })
    ])

  ])
}