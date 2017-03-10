import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import EditableValCell from './editable_val_cell'
import Autocompletable from './traits/autocompletable'
import Removable from './traits/removable'
import FormCell from './traits/form_cell'

const BaseClass = R.pipe(
  Removable,
  Autocompletable,
  FormCell
)(EditableValCell)

export default class FormValCell extends BaseClass {

  constructor(props){
    super(props)

    if(!this.state)this.state = {}
    this.state.didCommit = false
  }

  _formCellPlaceholder(){
    return h.small([
      `Set ${this.props.environment} value`,
      h.em(".optional", "(optional)")
    ])
  }

  _undefinedVal(){
    return this.state.didCommit ?
      super._undefinedVal() :
      this._formCellPlaceholder()
  }

  _commit(update){
    this.setState({didCommit: true})
    super._commit(update)
  }

}