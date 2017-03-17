import R from 'ramda'
import EditableValCell from './editable_val_cell'
import Removable from './traits/removable'
import Autocompletable from './traits/autocompletable'
import CopyableCell from './traits/copyable_cell'
import CommitPromptable from './traits/commit_promptable'

const EnvValCellBaseClass = R.pipe(
  CopyableCell,
  Removable,
  Autocompletable,
  CommitPromptable
)(EditableValCell)

export default class EnvValCell extends EnvValCellBaseClass {
  _commit(update){
    this.props.onCommitEntryVal(
      this.props.entryKey,
      this.props.environment,
      (update || {val: this.state.inputVal})
    )
  }
}