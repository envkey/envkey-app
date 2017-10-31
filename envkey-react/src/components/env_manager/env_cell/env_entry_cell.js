import React from 'react'
import R from 'ramda'
import EditableEntryCell from './editable_entry_cell'
import Removable from './traits/removable'
import OnRemoveConfirmable from './traits/on_remove_confirmable'
import CommitPromptable from './traits/commit_promptable'

// Make editable/removable cell class for base class
const EditableRemovableCell = R.pipe(
  Removable,
  CommitPromptable
)(EditableEntryCell)

class EnvEntryCell extends EditableRemovableCell {

  _onRemove(){
    this.props.removeEntry(this.props.entryKey, this.props.subEnvId)
  }

  _commit(){
    this.props.onCommitEntry(this.props.entryKey, this.state.inputVal)
  }

}

// Add on remove confirmable behavior
export default OnRemoveConfirmable(EnvEntryCell)