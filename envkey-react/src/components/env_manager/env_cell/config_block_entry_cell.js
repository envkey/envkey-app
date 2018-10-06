import React from 'react'
import LockedEntryCell from './locked_entry_cell'

export default class ConfigBlockEntryCell extends LockedEntryCell {

  _classNames(){
    return super._classNames().concat([
      "config-block-entry-cell"
    ])
  }

}