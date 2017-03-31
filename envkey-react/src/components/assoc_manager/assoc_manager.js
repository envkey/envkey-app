import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import AssocColumn from "./assoc_column"

export default class AssocManager extends React.Component {

  _classNames(){
    return [
      `${this.props.parentType}-${this.props.assocType}`
    ]
  }

  render(){
    return h.div(".association-manager",
      {className: this._classNames().join(" ")},
      this._renderContents()
    )
  }

  _renderContents(){
    return this._renderColumns()
  }

  _renderColumns(){
    const {columnsConfig} = this.props
    return columnsConfig.columns.map((config, i) => {
      const hideWhenFn = config.hideWhenFn
      if(!(hideWhenFn && hideWhenFn))
      return h(AssocColumn, {
        ...this.props,
        config,
        key: i,
        rowDisplayType: columnsConfig.rowDisplayType
      })
    })
  }
}
