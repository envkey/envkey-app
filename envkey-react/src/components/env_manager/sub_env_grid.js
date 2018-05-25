import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import EnvGrid from './env_grid'
import SubEnvFormEntryCell from './env_cell/sub_env_form_entry_cell'
import {allEntries} from 'lib/env/query'

export default class SubEnvGrid extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      showTransitionOverlay: false
    }
  }

  componentWillReceiveProps(nextProps){
    if(this._id() != this._id(nextProps)){
      this.setState({showTransitionOverlay: true})
      setTimeout(()=>{ this.setState({showTransitionOverlay: false}) }, 1)
    }
  }

  _id(props){
    return (props || this.props).subEnv["@@__id__"]
  }

  _name(){
    return this.props.subEnv["@@__name__"]
  }

  _isEmpty(){
    return allEntries(this.props.subEnv).length == 0
  }

  render(){
    return h.div(".sub-env-grid", [
      this._renderHeader(),
      this._renderGrid()
    ])
  }

  _renderHeader(){
    return h.header([
      h.div(".actions")
    ])
  }

  _renderGrid(){
    const id = this._id(),
          name = this._name()
    return h.div([
      h.div(".transition-overlay", {className: (this.state.showTransitionOverlay ? "" : "hide")}),
      this._renderEmpty(),
      h(EnvGrid, {
        ...this.props,
        fullEnvsWithMeta: this.props.envsWithMeta,
        envsWithMeta: {[id]: this.props.subEnv},
        subEnvId: id,
        subEnvName: name,
        environments: [id],
        environmentsAssignable: [id],
        environment: id,
        parentEnvironment: this.props.environment,
        formEntryCellClass: SubEnvFormEntryCell
      })
    ])
  }

  _renderEmpty(){
    if(this.props.isReadOnly && this._isEmpty()){
      return h.p(".empty-msg", `${this._name()} has no variables set.`)
    }
  }

}