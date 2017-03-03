import React from 'react'
import {Link} from 'react-router'
import h from "lib/ui/hyperscript_with_helpers"
import KeyableActions from "./keyable_actions"

export default function ({
  params,
  parentType,
  assocType,
  onCopy,
  onRenew,
  isRemoving,
  isGeneratingAssocKey,
  parent: {isCurrentUser},
  assoc: {name, relation, slug},
  config: {keyLabel}
}){

  // const renderKeyableActions = ()=>{
  //   if(parentType == "user"){
  //     return h(KeyableActions, {
  //       parentType,
  //       assocType,
  //       keyLabel,
  //       isRemoving,
  //       isGeneratingAssocKey,
  //       onCopy,
  //       onRenew,
  //       isCurrentUser,
  //       envkey: relation.envkey,
  //       createdAt: relation.createdAt
  //     })
  //   }
  // }


  return h.div([
    h.div(".top-row", [
      h.span(".primary", [
        h(Link, {to: `/${params.orgSlug}/apps/${slug}`}, name)
      ])
    ]),

    // h.div(".bottom-row", [renderKeyableActions()])
  ])

}