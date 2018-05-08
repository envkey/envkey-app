import React from 'react'
import ValCell from './val_cell'
import Editable from './traits/editable'

// Make editable val cell class
const EditableValCellBase = Editable(ValCell, {multiline: true})

export default class EditableValCell extends EditableValCellBase {

  _inputPlaceholder(){ return "Insert value or choose below." }

}
