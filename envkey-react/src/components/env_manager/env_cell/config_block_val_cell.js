import LockedValCell from './locked_val_cell'
import CopyableCell from './traits/copyable_cell'

export default class ConfigBlockValCell extends CopyableCell(LockedValCell) {
  _showLockImg(){
    return false
  }
}