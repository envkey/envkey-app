import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'

export default class BasicRenameForm extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      name: props.name
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.name != nextProps.name){
      this.setState({name: nextProps.name})
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onRename({name: this.state.name})
  }

  render(){
    return h.form(".rename", {onSubmit: ::this._onSubmit}, [
      h.input(".name", {
        placeholder: `${this.props.label} Name`,
        required: true,
        value: this.state.name,
        onChange: (e)=> this.setState({name: e.target.value})
      }),
      this._renderButton()
    ])
  }

  _renderButton(){
    if(this.props.isRenaming){
      return h(SmallLoader)
    } else {
      return h.button("Rename")
    }
  }
}