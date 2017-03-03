import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import copy from 'copy-to-clipboard'
import FlashableCell from './flashable_cell'

const CopyableCell = Cell => class extends FlashableCell(Cell) {

  _onCopy(){
    const res = copy(this._valString() || "", {message: "Copy the text below with #{key}"})
    if (res)this.flash("Copied to clipboard.")
  }

  _actions(){
    return super._actions().concat([
      {type: "copy", onClick: ::this._onCopy, img: "copy-circle-black.png"}
    ])
  }
}

export default CopyableCell