import React from 'react'
import {Link} from 'react-router'
import h from "lib/ui/hyperscript_with_helpers"
import KeyableActions from "./keyable_actions"
import AppUserStatus from "./app_user_status"

export default function ({params,
                          parentType,
                          assocType,
                          onCopy,
                          onRenew,
                          isRemoving,
                          isGeneratingAssocKey,
                          isGrantingEnvAccess,
                          permissions: {read: {user: canReadUser}},
                          assoc: {firstName, lastName, email, slug, relation, isCurrentUser},
                          config: {keyLabel}}){

  const
    renderUserLabel = ()=>{
      const name = [firstName, lastName].join(" ")
      if(canReadUser){
        return h.span(".primary", [
          h(Link, {to: `/${params.orgSlug}/users/${slug}`}, name)
        ])
      } else {
        return h.span(".primary", name)
      }
    }

  return h.div([
    h.div(".top-row", [
      renderUserLabel(),
      h.span(".secondary", email)
    ]),

    h.div(".bottom-row", [
      h(AppUserStatus, {
        ...relation.accessStatus,
        isGrantingEnvAccess
      })
    ])

  ])

}