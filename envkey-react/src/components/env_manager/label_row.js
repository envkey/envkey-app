import React from 'react'

import h from "lib/ui/hyperscript_with_helpers"
import {imagePath} from "lib/ui"

export default function({parent, environments, onOpenSubEnvs}) {

  const
    renderEnvLabel = (environment, i)=> {
      const locked = parent.role == "development" && environment == "production"
      return h.div(".label-cell", {
        key: i,
        className: `env-${environment} ${locked ? 'locked' : ''}`
      }, [
        h.span(".open-subenvs", {onClick: ()=> onOpenSubEnvs(environment)}, [
          h.img({src: imagePath("subenvs-white.svg")})
        ]),
        h.label([
          locked ? h.img(".img-locked", {src: imagePath("padlock.svg")}) : "",
          environment
        ])
      ])
    }

  return h.div(".row.label-row",
    [h.div(".cols", environments.map(renderEnvLabel))]
  )
}