import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
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

  _classNames(){
    return super._classNames().concat([
      (this.props.socketUserEditingEntryVal ? "socket-editing-entry-val" : "")
    ])
  }

  _renderCellContents(){
    return super._renderCellContents().concat([
      this._renderSocketEditingOverlay()
    ])
  }

  _renderSocketEditingOverlay(){
    const {firstName, lastName} = (this.props.socketUserEditingEntryVal || {})
    return h.div(".socket-entry-overlay.socket-edit-entry-val", {
      className: (this.props.socketUserEditingEntryVal ? "show" : "")
    }, [
      h.span(".name", [firstName, lastName].join(" ")),
      h.span(" is editing")
    ])
  }

}