import React from 'react'
import EditableEntryCell from './editable_entry_cell'
import Removable from './traits/removable'
import OnRemoveConfirmable from './traits/on_remove_confirmable'

// Make editable/removable cell class for base class
const EditableRemovableCell = Removable(EditableEntryCell)

class EnvEntryCell extends EditableRemovableCell {

  _onRemove(){
    this.props.removeEntry(this.props.entryKey)
  }

  _commit(){
    this.props.onCommitEntry(this.props.entryKey, this.state.inputVal)
  }

}

// Add on remove confirmable behavior
export default OnRemoveConfirmable(EnvEntryCell)