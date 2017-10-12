import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

export default class SubEnvsList extends React.Component {

  render(){
    return h.div(".sub-envs-list", this._renderContent())
  }

  _renderContent(){
    return [
      this._renderList(),
      this._renderActions()
    ]
  }

  _renderList(){
    return h.ul(this.props.subEnvs.map(::this._renderListItem))
  }

  _renderListItem({"@@__name__": name, "@@__id__": id}){
    return h.li({onClick: ()=> this.props.onSelect(id)}, [
      h.label(name)
    ])
  }

  _renderActions(){
    return h.div(".actions", [
      h.div(".add-subenv", {onClick: this.props.onAddSubEnv}, [
        h.label("Add Sub-environment")
      ])
    ])
  }
}