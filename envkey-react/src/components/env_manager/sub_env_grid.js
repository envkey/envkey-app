import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import EnvGrid from './env_grid'

export default class SubEnvGrid extends React.Component {


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
    const id = this.props.subEnv["@@__id__"],
          name = this.props.subEnv["@@__name__"]
    return h(EnvGrid, {
      ...this.props,
      envsWithMeta: {[id]: this.props.subEnv},
      subEnvId: id,
      subEnvName: name,
      environments: [id],
      environmentsAssignable: [id],
      environment: id,
      parentEnvironment: this.props.environment
    })
  }

}