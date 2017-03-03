import React from 'react'
import EntryCell from './entry_cell'
import Editable from './traits/editable'

// Make editable entry cell class
const EditableEntryCellBase = Editable(EntryCell)

export default class EditableEntryCell extends EditableEntryCellBase {

  _transformInputVal(val){ return val.trim().toUpperCase() }

  _inputPlaceholder(){ return "VARIABLE_NAME" }

}
