import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import MultiSelect from './multi_select'
import SmallLoader from './small_loader'

export default class MultiSelectForm extends React.Component {

  constructor(props){
    super(props)
    this.state = {numSelected: 0}
  }

  render(){
    return h.div(".multi-select-form", [
      h(MultiSelect, {
        ref: "multiSelect",
        onItemSelected: item => this.setState(state => ({numSelected: state.numSelected + 1})),
        onItemDeselected: item => this.setState(state => ({numSelected: state.numSelected - 1})),
        ...this.props
      }),
      this._renderSubmit()
    ])
  }

  _renderSubmit(){
    if (this.props.isSubmitting) return h(SmallLoader)

    return h.button(".submit", {
      disabled: this.state.numSelected == 0,
      onClick: e => this.props.onSubmit(this.refs.multiSelect.getSelected())
    },
      this.props.submitLabelFn ? this.props.submitLabelFn(this.state.numSelected) :
                                 `Submit ${this.state.numSelected} items`
    )
  }

}
