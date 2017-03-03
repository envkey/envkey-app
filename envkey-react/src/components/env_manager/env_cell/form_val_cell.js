import R from 'ramda'
import EditableValCell from './editable_val_cell'
import Autocompletable from './traits/autocompletable'
import Removable from './traits/removable'
import FormCell from './traits/form_cell'

export default R.pipe(
  Removable,
  Autocompletable,
  FormCell
)(EditableValCell)