import EditableEntryCell from './editable_entry_cell'
import FormCell from './traits/form_cell'

export default class FormEntryCell extends FormCell(EditableEntryCell){

  _renderCellContents(){
    if (this.props.isEditing){
      return [this._renderInput()]
    } else if(!this.state.inputVal) {
      return [this._renderInput()].concat(super._renderCellContents())
    } else {
      return super._renderCellContents()
    }
  }

  _inputPlaceholder(){ return "NEW_VARIABLE_NAME" }

}