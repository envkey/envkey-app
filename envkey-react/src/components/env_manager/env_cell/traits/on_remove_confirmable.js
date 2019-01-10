import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import ConfirmAction from 'components/shared/confirm_action'

const OnRemoveConfirmable = Editable => class extends Editable {

  constructor(props){
    super(props)
    this.state.showConfirm = false
  }

  _onConfirmRemove(){
    this.setState({showConfirm: false})
    super._onRemove()
  }

  _onRemove(){
    if (this._shouldConfirm()){
      this.setState({showConfirm: true})
    } else {
      super._onRemove()
    }
  }

  _shouldConfirm(){
    return true
  }

  _confirmText(){
    return "Remove var?"
  }

  _confirmButtonLabel(){
    return "Remove"
  }

  _classNames(){
    return super._classNames().concat([
      (this.state.showConfirm ? "confirming" : "")
    ])
  }

  _renderCell(){
    return super._renderCell().concat([
      this._renderConfirm()
    ])
  }

  _renderConfirm(){
    return h(ConfirmAction, {
      confirmText: this._confirmText(),
      confirmLabel: this._confirmButtonLabel(),
      onCancel: ()=> this.setState({showConfirm: false}),
      onConfirm: ::this._onConfirmRemove
    })
  }
}

export default OnRemoveConfirmable