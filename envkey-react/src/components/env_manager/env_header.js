import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { imagePath } from "lib/ui"
import Filter from 'components/shared/filter'
import BroadcastLoader from 'components/shared/broadcast_loader'

export default function({parentType,
                         emptyOnInit,
                         addVar,
                         hideValues,
                         isEmpty,
                         isUpdatingEnv,
                         entries,
                         hasAnyVal,
                         onToggleHideValues,
                         onFilter,
                         onAddVar }) {

  const
    renderFilter = ()=> {
      if(entries.length > 1){
        return h(Filter, {placeholder: "Type here to filter...", onFilter})
      }
    },

    renderAddVar = ()=>{
      if (!emptyOnInit){
        return h.button(".split-strong.add-var", {
          className: (addVar ? " selected" : ""),
          onClick: onAddVar
        }, [
          addVar ? h.strong("⨉") :
                   h.span([
                            // h.img({src: imagePath("var-black.svg")}),
                            h.span([
                              "Add",
                              " ",
                              h.strong("Var")
                            ])
                          ])
        ])
      }
    },

    renderShowHide = ()=> {
      if (!isEmpty && hasAnyVal){
        return h.label(".show-hide",[
          h.input({
            type: "checkbox",
            checked: hideValues,
            onClick: onToggleHideValues
          }),
          h.img({src: imagePath("hide-white.svg")})
        ])
      }
    },

    renderUpdatingEnv = ()=>{
      return h.span(".updating-env-msg", [
        h(BroadcastLoader),
        h.span("Encrypting and syncing")
      ])
    }


  return h.header(".env-header", [
    // renderFilter(),
    // renderAddVar(),
    renderShowHide(),
    renderUpdatingEnv()
  ])
}