import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import AssocColumn from "./assoc_column"
import DecryptForm from 'components/shared/decrypt_form'
import DecryptLoader from 'components/shared/decrypt_loader'
import {AwaitingAccessContainer} from 'containers'

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
    if (!this.props.envAccessGranted){
      return [h(AwaitingAccessContainer)]
    } else if(this.props.envsAreDecrypted || this.props.isDecrypting){
      return this._renderColumns().concat([
        h(DecryptLoader, this.props)]
      )
    }  else {
      return [h(DecryptForm, {onSubmit: this.props.decrypt})]
    }
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
