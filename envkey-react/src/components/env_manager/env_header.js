import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { imagePath } from "lib/ui"
import Filter from 'components/shared/filter'
import BroadcastLoader from 'components/shared/broadcast_loader'

export default function({parentType,
                         emptyOnInit,
                         addVar,
                         addService,
                         hideValues,
                         isEmpty,
                         isUpdatingEnv,
                         entries,
                         onToggleHideValues,
                         onFilter,
                         onAddVar,
                         onAddService }) {

  const
    renderFilter = ()=> {
      if(!addService && entries.length > 1){
        return h(Filter, {placeholder: "Type here to filter...", onFilter})
      }
    },

    renderAddVar = ()=>{
      if (!addService && !emptyOnInit){
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

    renderAddService = ()=>{
      // if (parentType == "app"){
      //   return h.button(".split-strong.add-service", {
      //     className: (addService ? " selected" : ""),
      //     onClick: onAddService
      //   }, [
      //     addService ? h.span(["Go", " ", h.strong("Back")]) :
      //                  h.span([
      //                           // h.img({src: imagePath("lightning-black.svg")}),
      //                           h.span([
      //                             "Add",
      //                             " ",
      //                             h.strong("Mixin")
      //                           ])
      //                         ])
      //   ])
      // }
    },

    renderShowHide = ()=> {
      if (!addService && !isEmpty){
        return h.button(".split-strong.show-hide-toggle", {
          onClick: onToggleHideValues
        }, [
          // h.img({src: imagePath("eye-black.svg")}),
          h.span([
            (hideValues ? "Show" : "Hide"),
            " ",
            h.strong("Values")
          ])
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
    renderFilter(),
    renderAddVar(),
    renderAddService(),
    renderShowHide(),
    renderUpdatingEnv()
  ])
}