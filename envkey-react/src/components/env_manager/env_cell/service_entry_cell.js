import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import EntryCell from './entry_cell'

export default class ServiceEntryCell extends EntryCell {

  _classNames(){
    return super._classNames().concat([
      "service-entry-cell"
    ])
  }

}