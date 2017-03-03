import React from 'react'

import h from "lib/ui/hyperscript_with_helpers"

export default function({environments}) {

  const renderLabel = (environment, i)=> {
    return h.div(".label-cell", {key: i, className: `env-${environment}`}, [
      h.label(environment)
    ])
  }

  return h.div(".row.label-row",
    [h.div(".cols", environments.map(renderLabel))]
  )
}