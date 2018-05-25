import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import LabelRow from './label_row'
import EntryFormRow from './entry_form_row'
import SmallLoader from 'components/shared/small_loader'

export default class EntryForm extends React.Component {

  _onSubmit(){
    const formData = this.refs.entryFormRow.formData()
    if (formData.entryKey){
      this.props.onSubmit(formData)
      this.refs.entryFormRow.reset()
    }
  }

  componentWillReceiveProps(nextProps){
    if (this.props.parent.id != nextProps.parent.id){
      this.refs.entryFormRow.reset()
    }
  }

  render(){
    return h.div(".entry-form", [

      h(EntryFormRow, {
        ...this.props,
        ref: "entryFormRow"
      }),

      h.div(".submit-row", [this._renderSubmit()])
    ])
  }

  _renderSubmit(){
    if (!(this.props.editingMultilineEnvironment && !this.props.editingMultilineEntryKey)){
      return h.button(".submit",{onClick: ::this._onSubmit}, "Add Variable")
    }
  }

}