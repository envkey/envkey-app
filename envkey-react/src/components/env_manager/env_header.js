import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import { imagePath } from "lib/ui"
import BroadcastLoader from 'components/shared/broadcast_loader'

export default function({parentType,
                         parent,
                         emptyOnInit,
                         hideValues,
                         isEmpty,
                         entries,
                         onToggleHideValues}) {

  const
    renderTitleCell = ()=> h.div(".label-cell.title-cell", {key: "title"}, [
      h.label(parent.name)
    ]),

    renderShowHide = ()=> {
      return h.label(".show-hide",[
        h.input({
          type: "checkbox",
          checked: hideValues,
          onClick: onToggleHideValues
        }),
        h.img({src: imagePath("hide-white.svg")})
      ])
    },

    renderUpdatingEnv = ()=>{
      return h.span(".updating-env-msg", [
        h(BroadcastLoader),
        h.span("Encrypting and syncing")
      ])
    }

  return h.header(".env-header", [
    renderTitleCell(),
    renderShowHide(),
    renderUpdatingEnv()
  ])
}