import React from 'react'
import R from 'ramda'
import h from 'lib/ui/hyperscript_with_helpers'
import {Link} from 'react-router'
import {imagePath} from 'lib/ui'
import ConfirmAction from 'components/shared/confirm_action'

export default class SubEnvsList extends React.Component {

  constructor(props){
    super(props)
    this.state = { confirmingDelete: null }
  }

  _onDeleteClickFn(id){
    return e => this.setState({confirmingDelete: id})
  }

  _onDeleteConfirmFn(id){
    return e => this.props.removeSubEnv({parentEnvironment: this.props.environment, id})
  }

  render(){
    return h.div(".sub-envs-list", this._renderContent())
  }

  _renderContent(){
    return [
      this._renderHeader(),
      this._renderList()
    ]
  }

  _renderHeader(){
    return h.header([
      h.label([
        h.img({src: imagePath("subenvs-white.svg")}),
        h.span("Sub-environments")
      ]),

      this._renderAddSubEnv()
    ])
  }

  _renderAddSubEnv(){
    if (!this.props.isReadOnly){
      const addBtnFn = this.props.isAddingSubEnv ?
        R.partial(h.span, [".add-subenv.selected"]) :
        R.partial(h, [Link, {
          className: "add-subenv",
          to: this.props.location.pathname.replace(new RegExp(`/${this.props.params.sub}/.*$`), `/${this.props.params.sub}/add`)
        }])

      return addBtnFn([h.i("+")])
    }
  }

  _renderList(){
    return h.ul(this.props.subEnvs.map(::this._renderListItem))
  }

  _renderListItem({"@@__name__": name, "@@__id__": id}){
    const selected = this.props.selected == id,
          contentFn = selected ?
            R.partial(h.div, [".content"]) :
            R.partial(h, [Link, {
              className: "content",
              to: this.props.location.pathname.replace(new RegExp(`/${this.props.params.sub}/.*$`), `/${this.props.params.sub}/${id}`)
            }])

    return h.li({
      className: (selected ? "selected" : "") +
                 (this.state.confirmingDelete == id ? " confirming-delete" : "")
    }, [
      this._renderDelete(id),
      contentFn([
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

  _renderDelete(id){
    if (!this.props.isReadOnly){
      return h.span(".delete", {
        onClick: this._onDeleteClickFn(id)
      }, [
        h.img(".delete-dark", {src: imagePath("remove-circle-black.png")}),
        h.img(".delete-light", {src: imagePath("remove-circle-white.png")})
      ])
    }
  }
}