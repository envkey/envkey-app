import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import KeyableActions from "./keyable_actions"

export default function(props){
  const name = (props.assoc.isDefault ? "Default Key" : props.assoc.name)
  return h.div([
    h.span(".name", name),
    h.div(".bottom-row", [
      h(KeyableActions, {
        ...props,
        ...props.assoc,
        ...props.config
      })
    ])
  ])
}