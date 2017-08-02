import h from "lib/ui/hyperscript_with_helpers"
import EntryCell from './entry_cell'

export default class LockedEntryCell extends EntryCell {

  _classNames(){
    return super._classNames().concat([
      "locked"
    ])
  }

}