import h from "lib/ui/hyperscript_with_helpers"
import LockedValCell from './locked_val_cell'

export default class LockedFormValCell extends LockedValCell {

  _valDisplay(){
    return h.small("Not permitted")
  }

}