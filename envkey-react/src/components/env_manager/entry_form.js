import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import LabelRow from './label_row'
import EntryFormRow from './entry_form_row'
import SmallLoader from 'components/shared/small_loader'

export default class EntryForm extends React.Component {

  _onSubmit(){
    this.props.onSubmit(this.refs.entryFormRow.formData())
  }

  render(){
    return h.div(".grid.env-grid.entry-form", [
      h(LabelRow, {environments: this.props.environments}),

      h(EntryFormRow, {
        environments: this.props.environments,
        ref: "entryFormRow"
      }),

      this._renderSubmit()
    ])
  }

  _renderSubmit(){
    if(this.props.isSubmitting){
      return h(SmallLoader)
    } else {
      return h.button({onClick: ::this._onSubmit}, "Create Var")
    }
  }

}