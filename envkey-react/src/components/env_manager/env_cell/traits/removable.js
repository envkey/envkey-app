import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

const Removable = Cell => class extends Cell {

  _onRemove(){
    this._commit({val: null, inherits: null})
  }

  _actions(){
    return super._actions().concat([
      {type: "remove", onClick: ::this._onRemove, img: "remove-circle-black.png"}
    ])
  }
}

export default Removable