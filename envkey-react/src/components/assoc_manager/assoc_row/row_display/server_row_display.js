import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import KeyableActions from "./keyable_actions"

export default function(props){
  return h.div([
    h.div(".top-row", [
      h.span(".primary", props.assoc.name)
    ]),

    h.div(".bottom-row", [
      h(KeyableActions, {
        ...props,
        ...props.assoc,
        ...props.config
      })
    ])
  ])
}