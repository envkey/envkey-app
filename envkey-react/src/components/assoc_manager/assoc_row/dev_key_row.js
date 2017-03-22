import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import KeyGeneratable from './traits/key_generatable'
import KeyableActions from './row_display/keyable_actions'

class DevKeyRow extends React.Component {

  _classNames(){
    return ["association-row", "dev-key-row"]
  }

  _renderContents(){
    return [
      h.div(".bottom-row", [
        h(KeyableActions, {
          ...this.props,
          ...this.props.assoc,
          isCurrentUser: true,
          isGeneratingAssocKey: this.props.isGeneratingAssocKeyFn(this.props.assoc.id),
          onRenew: ()=> this.props.generateKey(this.props.assoc.id)
        })
      ])
    ]
  }

  render(){
    return h.div({className: this._classNames().join(" ")}, this._renderContents())
  }
}



export default KeyGeneratable(DevKeyRow)