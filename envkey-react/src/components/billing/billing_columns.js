import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

export default function({columns}){
  const
    renderBillingList = (header, items)=> h.div(".billing-list", [
      (header ? h.h4(header) : null),
      h.div(".items", items.map((i)=> h.p([i])))
    ])

  return h.div(".billing-columns",
    columns.map(lists => h.div(".column",
      lists.map(([header, items])=> renderBillingList(header, items)))
    )
  )
}


