import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import EnvHeader from './env_header'
import EnvGrid from './env_grid'
import {AddAssoc} from 'components/assoc_manager'

export default class EnvManager extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      addVar: true,
      addService: false,
      hideValues: true,
      filter: ""
    }
  }

  _isEmpty(arg=null){
    const props = arg || this.props
    return props.entries.length + R.keys(props.entriesByServiceId) == 0
  }

  _onAddServices(...args){
    this.setState({addService: false})
    this.props.addServices(...args)
  }

  _onCreateService(...args){
    this.setState({addService: false})
    this.props.createService(...args)
  }

  _classNames(){
    return [
      "environments",
      [this.props.parentType, "parent"].join("-"),
      (this.state.addVar ? "add-var" : ""),
      (this.state.addService ? "add-service" : ""),
      (this.props.isUpdatingEnv ? "updating-env" : ""),
      (this._isEmpty() ? "empty" : ""),
      (this.state.hideValues ? "hide-values" : ""),
      (this.props.hasAnyVal ? "" : "has-no-val")
    ]
  }

  render(){
    return h.div({className: this._classNames().join(" ")}, this._renderContents())
  }

  _renderContents(){
    return [
      this._renderHeader(),
      this._renderBody()
    ]
  }

  _renderBody(){
    if (this.state.addService){
      return this._renderAddService()
    } else {
      return this._renderGrid()
    }
  }

  _renderHeader(){
    return h(EnvHeader, {
      ...this.props,
      ...R.pick(["addVar", "addService", "hideValues"], this.state),
      isEmpty: this._isEmpty(),
      onFilter: s => this.setState({filter: s.trim().toLowerCase()}),
      onToggleHideValues: ()=> this.setState(state => ({hideValues: !state.hideValues})),
      onAddVar: ()=> this.setState(state => ({addVar: !state.addVar})),
      onAddService: ()=> this.setState(state => ({addService: !state.addService}))
    })
  }

  _renderAddService(){
    return h(AddAssoc, {
      ...this.props.addServiceConfig,
      addAssoc: ::this._onAddServices,
      createAssoc: ::this._onCreateService
    })
  }

  _renderGrid(){
    return h(EnvGrid, {
      ...this.props,
      ...R.pick(["hideValues", "filter", "addVar"], this.state)
    })
  }
}

