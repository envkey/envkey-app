import React from 'react'
import {Link} from 'react-router'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'
import ConfigBlockEntryRow from './config_block_entry_row'
import {imagePath} from 'lib/ui'

export default function(props){
  const {
    block,
    isRemoving,
    entries,
    filter,
    removeConfigBlock,
    params
  } = props

  const
    renderEntryRow = (entryKey, i)=>{
      if(filter && !entryKey.toLowerCase().includes(filter))return
      return h(ConfigBlockEntryRow, {
        key: i,
        block,
        entryKey,
        ...props,
      })
    },

    renderConfigBlockEntryRows = ()=>{
      return h.div(".block-entry-rows", entries.map(renderEntryRow))
    },

    renderConfigBlockLabel = ()=>{
      return h.div(".block-label", [
        h.div(".label", [
          h.img({src: imagePath("menu-blocks-white.svg")}),
          h.span(block.name),
          renderConfigBlockActions()
        ]),
      ])
    },

    renderConfigBlockActions = ()=>{
      const actions = isRemoving ?
        [h(SmallLoader)] :
        [
          h(Link, {
            to: `/${props.params.orgSlug}/configBlocks/${block.slug}/variables`,
            className: "edit"
          }, [
            h.img({src: imagePath("edit-circle-white.png")})
          ]),

          h.span(".remove", {
            onClick: e => removeConfigBlock(block.relation.id)
          }, [
            h.img({src: imagePath("remove-circle-white.png")})
          ])
        ]

      return h.div(".block-actions", actions)
    },

    classNames = [
      "config-block",
      (entries.length ? "" : "no-entries")
    ]

  return h.div({className: classNames.join(" ")}, [
    renderConfigBlockLabel(),
    renderConfigBlockEntryRows()
  ])
}