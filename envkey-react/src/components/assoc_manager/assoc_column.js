import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import AssocRow from "./assoc_row"
import AddAssoc from "./add_assoc"
import SmallLoader from 'components/shared/small_loader'
import {imagePath} from "lib/ui"

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
    return this.props.parentType == "user" ||
           R.path([this.props.joinType, "create"], this.props.parent.permissions)
  }

  render(){
    return h.div(".column.keyable-column", {
      className: [
        this.props.config.role,
        this.state.addMode ? "show-add-keyable" : ""
      ].join(" ")
    }, [
      this._renderHeader(),
      this._renderBody()
    ])
  }

  _renderAddButton(){
    if (this.props.config.isAddingAssoc){
      return h(SmallLoader)
    } else if (this._canAdd()) {
      return h.button({
        onClick: e => this.setState((state, props)=>({addMode: !state.addMode}))
      }, [
        h.span(this.state.addMode ? "⨉" : this.props.columnsConfig.addLabel)
      ])
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
        h.h4(".title", [
          h.em(title),
          (subtitle ? [" ", subtitle] : "")
        ]),
        this._renderAddButton()
      ]),

      this._renderPermissions(),
    ])
  }

  _renderBody(){
    return h.div(".column-body", [
      (this.state.addMode ? this._renderAddAssoc() : this._renderSections())
    ])
  }

  _renderAddAssoc(){
    return h(AddAssoc, {
      createAssoc: ::this._onCreateAssoc,
      addAssoc: ::this._onAddAssoc,
      ...this.props.columnsConfig,
      ...this.props.config
    })
  }

  _renderSections(){
    return h.div(".sections",
      R.values(R.mapObjIndexed(::this._renderSection, this.props.config.groups))
    )
  }

  _renderSection(associations, k){
    if (associations.length){
      return h.div(".section", {key: k}, [
        this._renderSectionTitle(k),
        h.div(".associations",
          associations.map(assoc => h(AssocRow, {...this.props, assoc}) )
        )
      ])
    }
  }

  _renderSectionTitle(k){
    const sectionLabelFn = this.props.config.sectionLabelFn

    if (sectionLabelFn){
      return  h.div(".section-title", [
        h.span(sectionLabelFn(k))
      ])
    }
  }
}