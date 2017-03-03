import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { imagePath } from "lib/ui"

export default function({parentType,
                         addVar,
                         addService,
                         hideValues,
                         onToggleHideValues,
                         onFilter,
                         onAddVar,
                         onAddService }) {

  const
    renderFilter = ()=> {
      if(!addVar && !addService){
        return h.div(".prefixed-input.filter", [
          h.span([h.img({src: imagePath("search.png")})]),
          h.input({
            placeholder: "Type here to filter...",
            onChange: (e)=> onFilter(e.target.value)
          })
        ])
      }
    },

    renderAddVar = ()=>{
      if (!addService){
        return h.button(".split-strong.add-var", {
          className: (addVar ? " selected" : ""),
          onClick: onAddVar
        }, [
          addVar ? h.span(["Go", " ", h.strong("Back")]) :
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
      if (parentType == "app" && !addVar){
        return h.button(".split-strong.add-service", {
          className: (addService ? " selected" : ""),
          onClick: onAddService
        }, [
          addService ? h.span(["Go", " ", h.strong("Back")]) :
                       h.span([
                                // h.img({src: imagePath("lightning-black.svg")}),
                                h.span([
                                  "Add",
                                  " ",
                                  h.strong("Service")
                                ])
                              ])
        ])
      }
    },

    renderShowHide = ()=> {
      if (!addVar && !addService){
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
    }

  return h.header(".env-header", [
    renderFilter(),
    renderAddVar(),
    renderAddService(),
    renderShowHide(),
    h.span(".line")
  ])
}