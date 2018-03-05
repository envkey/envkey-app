import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { imagePath } from "lib/ui"
import Filter from 'components/shared/filter'
import BroadcastLoader from 'components/shared/broadcast_loader'

export default function({parentType,
                         parent,
                         emptyOnInit,
                         hideValues,
                         isEmpty,
                         isUpdatingEnv,
                         entries,
                         filter,
                         showFilter,
                         onFilter,
                         onToggleFilter,
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
    },

    renderFilter = ()=>{
      return h(Filter, {
        onFilter,
        onToggleFilter,
        value: filter,
        placeholder: "Filter by variable name…",
        onKeyDown: (e)=> {
          if (e.keyCode == 27){
            onToggleFilter()
          }
        }
      })
    }


  return h.header(".env-header", {
    className: (showFilter ? "show-filter" : "")
  }, [
    renderTitleCell(),
    renderShowHide(),
    renderUpdatingEnv(),
    renderFilter()
  ])
}