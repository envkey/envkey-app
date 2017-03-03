import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

export default function ({assoc: {name}}){

  return h.div([
    h.div(".top-row", [
      h.span(".primary", name)
    ])
  ])

}