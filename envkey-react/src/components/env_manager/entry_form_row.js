import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import FormEntryCell from './env_cell/form_entry_cell'
import FormValCell from './env_cell/form_val_cell'
import EditableCellsParent from './traits/editable_cells_parent'

const defaultEditing = {entryKey: "entry", environment: null}

export default class EntryFormRow extends EditableCellsParent(React.Component) {

  constructor(props) {
    super(props)

    this.state =  {
      envsWithMeta: props.environments.reduce((acc, environment) => {
        return {...acc, [environment]: {
          "entry": {val: null, inherits: null}
        }}
      }, {}),
      editing: defaultEditing,
      entryKey: ""
    }
  }

  formData() {
    return {
      entryKey: this.state.entryKey,
      vals: this._vals()
    }
  }

  _vals(){
    return R.mapObjIndexed(R.prop("entry"), this.state.envsWithMeta)
  }

  _clearEditing(){
    this.setState((state, props)=>({editing: (state.entryKey ? {} : defaultEditing)}))
  }

  render(){
    const {environments} = this.props

    return h.div(".row.entry-row", [
      h.div(".entry-col",[
        h(FormEntryCell, {
          onEditCell: ()=> this.setState({editing: defaultEditing}),
          onCommit: ({val})=> {
            this.setState({entryKey: val.trim().toUpperCase()})
            this._clearEditing()
          },
          onChange: (val)=> {
            this.setState({entryKey: val.trim().toUpperCase()})
          },
          val: this.state.entryKey.toUpperCase(),
          isEditing: this.state.editing.entryKey == "entry" && !this.state.editing.environment
        })
      ]),

      h.div(".val-cols", [
        environments.map((environment,i)=>{
          const envEntry = this.state.envsWithMeta[environment].entry
          return h.div(".val-col", {key: i}, [
            h(FormValCell, {
              ...envEntry, //for 'val' and 'inherits'
              environments,
              environment,
              onEditCell: ()=> this.setState({editing: {entryKey: "entry",environment}}),
              onCommit: (update)=> {
                this.setState(R.assocPath(["envsWithMeta", environment, "entry"], update))
                this._clearEditing()
              },
              isEditing: this.state.editing.environment === environment,
              entryKey: "entry",
              envsWithMeta: this.state.envsWithMeta
            })
          ])
        })
      ])

    ])
  }
}

