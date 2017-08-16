import React from 'react'
import {Link} from 'react-router'
import h from "lib/ui/hyperscript_with_helpers"

export default function ({
  params,
  parentType,
  assocType,
  onCopy,
  onRenew,
  isRemoving,
  parent: {isCurrentUser},
  assoc: {name, relation, slug},
}){

  return h.div([
    h.div(".top-row", [
      h.span(".primary", [
        h(Link, {to: `/${params.orgSlug}/apps/${slug}`}, name)
      ])
    ]),

  ])

}