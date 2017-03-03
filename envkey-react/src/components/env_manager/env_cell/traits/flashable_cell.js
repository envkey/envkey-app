import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import copy from 'copy-to-clipboard'
import Flashable from 'components/shared/traits/flashable'

const FlashableCell = Cell => class extends Flashable(Cell) {

  _renderCellContents(){
    return super._renderCellContents().concat([
      this._renderFlash()
    ])
  }
}

export default FlashableCell