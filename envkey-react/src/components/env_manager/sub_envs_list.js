import React from 'react'
import h from 'lib/ui/hyperscript_with_helpers'
import {imagePath} from 'lib/ui'
import ConfirmAction from 'components/shared/confirm_action'

export default class SubEnvsList extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      confirmingDelete: null
    }
  }

  _onDeleteClickFn(id){
    return e => this.setState({confirmingDelete: id})
  }

  _onDeleteConfirmFn(id){
    return e => this.props.removeSubEnv({environment: this.props.environment, id})
  }

  render(){
    return h.div(".sub-envs-list", this._renderContent())
  }

  _renderContent(){
    return [
      this._renderActions(),
      this._renderList()
    ]
  }

  _renderList(){
    return h.ul(this.props.subEnvs.map(::this._renderListItem))
  }

  _renderListItem({"@@__name__": name, "@@__id__": id}){
    return h.li({
      className: (this.props.selected == id ? "selected" : "") +
                 (this.state.confirmingDelete == id ? " confirming-delete" : "")
    }, [
      h.span(".delete", {
        onClick: this._onDeleteClickFn(id)
      }, [
        h.img(".delete-dark", {src: imagePath("remove-circle-black.png")}),
        h.img(".delete-light", {src: imagePath("remove-circle-white.png")})
      ]),
      h.div(".content", {
        onClick: ()=> this.props.onSelect(id)
      }, [
        h.label(name),
        h.img({src: imagePath("menu-right-arrow-white.png")})
      ]),

      h(ConfirmAction, {
        confirmText: `Remove?`,
        onConfirm: this._onDeleteConfirmFn(id),
        onCancel: ()=> this.setState({confirmingDelete: null})
      })
    ])
  }

  _renderActions(){
    if (!(this.props.app.role == "development" && this.props.environment == "production")){
      return h.div(".actions", [
        h.div(".add-subenv", {
          className: this.props.isAddingSubEnv ? "selected" : "",
          onClick: this.props.onSelectAddSubEnv
        }, [
          h.label("Add Sub-environment"),
          h.i("+")
        ])
      ])
    }
  }
}