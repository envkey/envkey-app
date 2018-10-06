import React from 'react'
import {Link} from 'react-router'
import h from "lib/ui/hyperscript_with_helpers"
import KeyableActions from "./keyable_actions"
import AppUserStatus from "./app_user_status"
import InviteActions from "../invite_actions"
import SmallLoader from "components/shared/small_loader"

export default function (props){
  const
    {params,
     parentType,
     assocType,
     onCopy,
     onRenew,
     isRemoving,
     isGeneratingAssocKey,
     getOrgUserForUserFn,
     isRevokingInviteByUserId,
     isRegeneratingInviteByUserId,
     router: {location: {pathname: currentPath}},
     permissions: {read: {user: canReadUser}},
     assoc: {id: userId, firstName, lastName, email, slug, relation, isCurrentUser},
     config: {keyLabel}} = props,

    canUpdateLocals = relation.permissions.updateLocalOverrides &&
                      relation.accessStatus &&
                      !["expired", "failed", "revoked"].includes(relation.accessStatus.status),

    renderUserLabel = ()=>{
      const name = [firstName, lastName].join(" ")
      if(canReadUser){
        return h.span(".primary", [
          h(Link, {to: `/${params.orgSlug}/users/${slug}/settings`}, name)
        ])
      } else {
        return h.span(".primary", name)
      }
    },

    renderInviteActions = ()=> {
      const orgUser = getOrgUserForUserFn(userId)
      if (orgUser.permissions.delete &&
          relation &&
          relation.accessStatus &&
          !["owner", "confirmed"].includes(relation.accessStatus.status)){
        return h(InviteActions, props)
      }
    },

    renderLocalsLink = ()=> {
      if (canUpdateLocals) {
        return h(Link, {to: `${currentPath}/${slug}/locals`, }, "Locals")
      }
    },

    renderUserActions = ()=> {
      let content
      if (isRevokingInviteByUserId[userId] || isRegeneratingInviteByUserId[userId]){
        content = [h(SmallLoader)]
      } else {
        content = [renderInviteActions(), renderLocalsLink()]
      }
      return h(".user-actions", content)
    },

    classNames = [
      "user-row-display",
      (canUpdateLocals ? "has-locals" : "")
    ]

  return h.div({className: classNames.join(" ")}, [
    h.div(".top-row", [
      renderUserLabel(),
      h.span(".secondary", email)
    ]),

    h.div(".bottom-row", [
      h(AppUserStatus, {
        ...relation.accessStatus
      }),
      renderUserActions()
    ])

  ])

}