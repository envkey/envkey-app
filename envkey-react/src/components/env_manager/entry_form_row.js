import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import FormEntryCell from './env_cell/form_entry_cell'
import FormValCell from './env_cell/form_val_cell'
import LockedFormValCell from './env_cell/locked_form_val_cell'
import EditableCellsParent from './traits/editable_cells_parent'

const
  defaultEditing = {entryKey: "entry", environment: null},

  defaultState = props => ({
    envsWithMeta: props.environmentsAssignable.reduce((acc, environment) => {
      return {...acc, [environment]: {
        "entry": {val: null, inherits: null}
      }}
    }, {}),
    editing: defaultEditing,
    didCommit: {},
    entryKey: "",
    hoveringVals: false
  })

export default class EntryFormRow extends EditableCellsParent(React.Component) {

  constructor(props) {
    super(props)
    this.state = defaultState(props)
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this._isEditing(this.state) && this._isEditing(nextState) && !this._formEmpty(nextState)){
      this.props.addingEntry()
    }
  }

  formData() {
    return {
      entryKey: this.state.entryKey,
      vals: this._vals()
    }
  }

  reset(){
    this.setState(defaultState(this.props))
  }

  _onChangeFn(prevState){
    return nextState => {
      if (this._formEmpty(prevState) && !this._formEmpty(nextState)){
        this.props.addingEntry()
      } else if (this._formEmpty(nextState) && !this._formEmpty(prevState)){
        this.props.stoppedAddingEntry()
      }
    }
  }

  _formEmpty(state=null){
    return !(state || this.state).entryKey && this._valsEmpty(state)
  }

  _valsEmpty(state=null){
    return R.pipe(
      R.values,
      R.none(R.pipe(R.props(["val", "inherits"]), R.any(Boolean)))
    )(this._vals(state))
  }

  _vals(state=null){
    return R.mapObjIndexed(R.prop("entry"), (state || this.state).envsWithMeta)
  }

  _preventClearEditingSelector(){
    return ".entry-form .cell"
  }

  _clearEditing(){
    this.setState({editing: {}})
  }

  _isEditing(state=null){
    return !R.isEmpty((state || this.state).editing)
  }

  _isEditingEntry(){
    return this.state.editing.entryKey == "entry" && !this.state.editing.environment
  }

  _renderFormCell(environment){
    if ((this.props.app && this.props.app.role == "development") && environment == "production"){
      return this._renderLockedCell()
    } else {
      return this._renderFormValCell(environment)
    }
  }

  _renderFormValCell(environment){
    let envEntry = this.state.envsWithMeta[environment].entry

    return h(FormValCell, {
      ...envEntry, //for 'val' and 'inherits'
      environments: this.props.environmentsAssignable,
      environment,
      didCommit: Boolean(R.path(["didCommit", environment], this.state)),
      isEditing: this.state.editing.environment === environment,
      entryKey: "entry",
      envsWithMeta: this.state.envsWithMeta,
      onEditCell: ()=> this.setState({editing: {entryKey: "entry",environment}}),
      onCommit: (update)=> {
        this.setState(R.pipe(
          R.assocPath(["envsWithMeta", environment, "entry"], update),
          R.assocPath(["didCommit", environment], true)
        ))
        this._clearEditing()
      },
      onChange: (val)=> {
        let state = this.state
        this.setState(
          R.assocPath(["envsWithMeta", environment, "entry"], {val, inherits: null}),
          this._onChangeFn(state)
        )
      }
    })
  }

  _renderLockedCell(){
    return h(LockedFormValCell)
  }

  render(){
    const {environments} = this.props

    return h.div(".row.entry-row",{
      className: (this._isEditingEntry() ? " editing-entry" : "") +
                 (this._isEditing() ? " is-editing" : "") +
                 (!this._formEmpty() ? " not-empty" : "") +
                 (this.state.hoveringVals ? " hovering-vals" : "")
    },[
      h.div(".entry-col",[
        h(FormEntryCell, {
          onEditCell: ()=> this.setState({editing: defaultEditing}),
          onCommit: ({val})=> {
            this.setState({entryKey: val.trim().toUpperCase()})
            this._clearEditing()
          },
          onChange: (val)=> {
            let state = this.state
            this.setState({entryKey: val.trim().toUpperCase()}, this._onChangeFn(state))
          },
          val: this.state.entryKey.toUpperCase(),
          isEditing: this._isEditingEntry()
        })
      ]),

      h.div(".val-cols", {
        onMouseOver: ()=> this.setState({hoveringVals: true}),
        onMouseOut: ()=> this.setState({hoveringVals: false})
      }, [
        environments.map((environment,i)=>{
          return h.div(".val-col", {key: i}, [this._renderFormCell(environment)])
        })
      ]),

      h.span(".submit-prompt", [
        h.i(".arrow", "←"),
        " Click to save"
      ])

    ])
  }
}

