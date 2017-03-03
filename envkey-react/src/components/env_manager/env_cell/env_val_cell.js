import R from 'ramda'
import EditableValCell from './editable_val_cell'
import Removable from './traits/removable'
import Autocompletable from './traits/autocompletable'
import CopyableCell from './traits/copyable_cell'

const EnvValCellBaseClass = R.pipe(
  CopyableCell,
  Removable,
  Autocompletable
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