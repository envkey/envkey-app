import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

const SocketEditable = Cell => class extends Cell {

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

export default SocketEditable