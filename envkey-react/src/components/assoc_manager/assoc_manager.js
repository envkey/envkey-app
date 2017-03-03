import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import AssocColumn from "./assoc_column"

export default function(props) {
  const {columnsConfig} = props
  return h.div(".association-manager",
    {className: `${props.parentType}-${props.assocType}`},
    columnsConfig.columns.map(config => {
      const hideWhenFn = config.hideWhenFn
      if(!(hideWhenFn && hideWhenFn))
      return h(AssocColumn, {
        ...props,
        config,
        rowDisplayType: columnsConfig.rowDisplayType
      })
    })
  )
}