import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import pluralize from 'pluralize'
import AssocRow from "./assoc_row"
import AddAssoc from "./add_assoc"
import SmallLoader from 'components/shared/small_loader'
import {imagePath} from "lib/ui"
import {dasherize} from "underscore.string"


export default class AssocColumn extends React.Component {

  constructor(props) {
    super(props)
    this.state = { addMode: false }
  }

  _onAddAssoc(...args){
    this.setState({addMode: false})
    this.props.addAssoc(...args)
  }

  _onCreateAssoc(...args){
    this.setState({addMode: false})
    this.props.createAssoc(...args)
  }

  _canAdd(){
    const canAdd = (this.props.parentType == "user" ||
                   R.path([this.props.joinType, "create"], this.props.parent.permissions)) &&
                    (this.props.columnsConfig.addFormType ||
                      (this.props.config.candidates && this.props.config.candidates.length))

    if (this.props.columnsConfig.canAddFn){
      return canAdd && this.props.columnsConfig.canAddFn(this.props)
    }

    return canAdd
  }

  _parentName(){
    const parentNameFn = this.props.columnsConfig.parentNameFn
    return parentNameFn ? parentNameFn(this.props.parent) : this.props.parent.name
  }

  _addLabel(){
    const labelOrFn = this.props.columnsConfig.addLabel
    if(!labelOrFn)return "+"
    return (typeof labelOrFn == "function" ? labelOrFn(this.props.config) : labelOrFn)
  }

  _removeLabel(){
    const labelOrFn = this.props.columnsConfig.removeLabel
    if(!labelOrFn)return [h.span("x")]
    return (typeof labelOrFn == "function" ? labelOrFn(this.props.config) : [h.span(labelOrFn)])
  }

  _numItems(){
    return R.flatten(R.values(this.props.config.groups)).length
  }

  render(){
    return h.div(".column.keyable-column", {
      className: [
        this.props.config.role,
        this.state.addMode ? "show-add-keyable" : "",
        this._numItems() == 1 ? "single-item" : ""
      ].join(" ")
    }, [
      this._renderHeader(),
      this._renderBody()
    ])
  }

  _renderAddButton(){
    if (this.props.columnsConfig.noAdd){
      return
    }

    if (this.props.config.isAddingAssoc || this.props.config.isCreating){
      return h(SmallLoader)
    } else if (this._canAdd()) {
      return h.button(".add-button", {
        onClick: e => this.setState((state, props)=>({addMode: !state.addMode}))
      }, (this.state.addMode ? this._removeLabel() : this._addLabel()))
    }
  }

  _renderPermissions(){
    const {permissionCopyLines} = this.props.config
    if (permissionCopyLines && permissionCopyLines.length){
      return h.div(".permissions", [
        h.ul(
          permissionCopyLines.map((permission,i) => h.li({key: i}, permission))
        )
      ])
    }
  }

  _renderHeader(){
    const {title, subtitle} = this.props.config

    return h.div(".column-header", [
      h.div(".head", [
        h.h6(".parent-name", this._parentName()),
        h.h4(".title", [
          h.em(title),
          (subtitle ? [" ", subtitle] : "")
        ]),
        (this.props.columnsConfig.inlineAddForm ? null : this._renderAddButton())
      ]),

      this._renderPermissions(),
    ])
  }

  _renderBody(){
    let contents
    if (this.state.addMode){
      if (this.props.columnsConfig.inlineAddForm){
        contents = [this._renderSections(), this._renderAddButton(), this._renderAddAssoc()]
      } else {
        contents = [this._renderAddAssoc()]
      }
    } else if (this.props.columnsConfig.inlineAddForm) {
      contents = [this._renderSections(), this._renderAddButton()]
    } else {
      contents = [this._renderSections()]
    }

    return h.div(".column-body", contents)
  }

  _renderAddAssoc(){
    return h(AddAssoc, {
      ...this.props,
      ...this.props.columnsConfig,
      ...this.props.config,
      createAssoc: ::this._onCreateAssoc,
      addAssoc: ::this._onAddAssoc
    })
  }

  _renderSections(){
    const sections = R.values(R.mapObjIndexed(::this._renderSection, this.props.config.groups))
    if (sections.length){
      return h.div(".sections", sections)
    } else {
      return this._renderEmptyState()
    }
  }

  _renderEmptyState(){
    if (!this.props.config.isAddingAssoc){
      return h.div(".empty-state", [h.p([
        h.strong(this._parentName()),
        ` has no ${pluralize(this.props.assocType)} with `,
        h.strong(".title", this.props.config.title),
        (this.props.config.subtitle ? " " : ""),
        h.span(".subtitle",this.props.config.subtitle),
        "."
      ])])
    }
  }

  _renderSection(associations, k){
    if (associations.length){
      return h.div(".section", {className: k == "null" ? "base-env" : "sub-env", key: k}, [
        this._renderSectionTitle(k),
        h.div(".associations",
          associations.map(assoc => h(AssocRow, {...this.props, assoc}))
        )
      ])
    }
  }

  _renderSectionTitle(k){
    const sectionTitleFn = this.props.columnsConfig.sectionTitleFn || this.props.config.sectionTitleFn,
          sectionSubtitleFn = this.props.columnsConfig.sectionSubtitleFn || this.props.config.sectionSubtitleFn
    if (sectionTitleFn){
      return  h.div(".section-title", [
        h.span(".title", sectionTitleFn(k, this.props)),
        h.span(".subtitle", sectionSubtitleFn ? sectionSubtitleFn(k, this.props) : "")
      ])
    }
  }
}