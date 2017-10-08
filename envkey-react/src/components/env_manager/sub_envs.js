import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

export default class SubEnvs extends React.Component {
  constructor(props){
    super(props)
  }

  render(){
    return h.div(".sub-envs", [
      h.h1("SUBENV: " + this.props.environment)
    ])
  }
}