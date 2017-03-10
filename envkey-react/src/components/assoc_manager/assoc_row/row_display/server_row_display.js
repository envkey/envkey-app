import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import KeyableActions from "./keyable_actions"
import KeyGenerated from "./key_generated"

export default class ServerRowDisplay extends React.Component {

  constructor(props){
    super(props)
    this.state = { showKeyGenerated: false }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.assoc.envkey &&
       nextProps.assoc.passphrase &&
       nextProps.assoc.keyGeneratedAt != this.props.assoc.keyGeneratedAt){
      this.setState({showKeyGenerated: true})
    }
  }

  render(){
    return this.state.showKeyGenerated ? this._renderKeyGenerated() : this._renderDisplay()
  }

  _renderKeyGenerated(){
    return h(KeyGenerated, {
      ...R.pick(["envkey", "passphrase"], this.props.assoc),
      onClose: ()=> this.setState({showKeyGenerated: false})
    })
  }

  _renderDisplay(){
    return h.div([
      h.div(".top-row", [
        h.span(".primary", this.props.assoc.name)
      ]),

      h.div(".bottom-row", [
        h(KeyableActions, {
          ...this.props,
          ...this.props.assoc,
          ...this.props.config
        })
      ])
    ])
  }
}