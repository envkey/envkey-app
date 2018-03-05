import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { imagePath } from "lib/ui"

export default function({
  placeholder,
  value,
  onFilter,
  onToggleFilter,
  onKeyDown
}){
  return h.div(".prefixed-input.filter", [
    h.span({
      onClick: ()=> { if(onToggleFilter) onToggleFilter() },
    }, [h.img({src: imagePath("search.png")})]),
    h.input({
      value,
      placeholder: (placeholder || "Type here to filter…"),
      onChange: (e)=> onFilter(e.target.value),
      onKeyDown: (e)=> {
        if (onKeyDown){
          onKeyDown(e)
        }
      }
    })
  ])
}