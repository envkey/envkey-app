import React from 'react'
import {Link} from 'react-router'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'
import ServiceEntryRow from './service_entry_row'
import {imagePath} from 'lib/ui'

export default function(props){
  const {
    service,
    isUpdatingService,
    entriesByServiceId,
    filter,
    removeService,
    params
  } = props

  const
    renderEntryRow = (entryKey, i)=>{
      if(filter && !entryKey.toLowerCase().includes(filter))return
      return h(ServiceEntryRow, {
        key: i,
        service,
        entryKey,
        ...props,
      })
    },

    renderServiceEntryRows = ()=>{
      const entries = entriesByServiceId[service.id]
      return h.div(".service-entry-rows", entries.map(renderEntryRow))
    },

    renderServiceLabel = ()=>{
      return h.div(".service-label", [
        h.div(".label", [
          h.span(service.name),
          renderServiceActions()
        ]),
      ])
    },

    renderServiceActions = ()=>{
      const actions = isUpdatingService ?
        [h(SmallLoader)] :
        [
          h(Link, {
            to: `/${props.params.orgSlug}/services/${service.slug}/environments`,
            className: "edit"
          }, [
            h.img({src: imagePath("edit-circle-white.png")})
          ]),

          h.span(".remove", {
            onClick: e => removeService(service.relation.id)
          }, [
            h.img({src: imagePath("remove-circle-white.png")})
          ])
        ]

      return h.div(".service-actions", actions)
    }

  return h.div(".service-block", [
    renderServiceLabel(),
    renderServiceEntryRows()
  ])
}


