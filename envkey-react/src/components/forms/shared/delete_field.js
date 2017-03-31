import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'

export default class DeleteField extends React.Component {

  _onRemoveClick(){
    if (this.props.confirmName){
      if (this.refs.confirm.value == this.props.confirmName){
        this.props.onRemove()
      }
    } else {
      this.props.onRemove()
    }
  }

  render(){
    return h.div(".delete-field", [
      this._renderConfirmation(),
      this._renderButton()
    ])
  }

  _renderButton(){
    if(this.props.isRemoving){
      return h(SmallLoader)
    } else {
      return h.button(
        {onClick: ::this._onRemoveClick},
        (this.props.fullLabel || `Delete ${this.props.label}`)
      )
    }
  }

  _renderConfirmation(){
    if(this.props.confirmName){
      const confirmPrompt = this.props.confirmPrompt || `the ${this.props.label.toLowerCase()} name`

      return h.div(".delete-confirmation", [
        h.input({ref: "confirm", placeholder: `To confirm, type ${confirmPrompt} here.`} )
      ])
    }
  }
}
