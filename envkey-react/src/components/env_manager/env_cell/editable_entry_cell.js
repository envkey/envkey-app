import React from 'react'
import EntryCell from './entry_cell'
import Editable from './traits/editable'

// Make editable entry cell class
const EditableEntryCellBase = Editable(EntryCell)

export default class EditableEntryCell extends EditableEntryCellBase {

  _transformInputVal(val){
    const res = val.trim(),
          autoCaps = this.props.parentType == "appUser" ? this.props.app.autoCaps : this.props.parent.autoCaps
    return autoCaps ? res.toUpperCase() : res
  }

  _inputPlaceholder(){ return "VARIABLE_NAME" }

}
