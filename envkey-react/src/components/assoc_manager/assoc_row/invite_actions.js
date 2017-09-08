import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from "components/shared/small_loader"

export default function ({
  assoc: {id: userId, relation: {accessStatus: {status}}},
  revokeInvite,
  regenInvite,
  isRevokingInviteByUserId,
  isRegeneratingInviteByUserId
}){
  const
    renderRevoke = ()=> {
      if (status != "revoked"){
        return h.a({onClick: e => revokeInvite(userId)}, "Revoke")
      }
    },

    renderRegen = ()=> {
      return h.a({onClick: e => regenInvite(userId)}, "Regenerate")
    },

    renderContent = ()=> {
      if (isRevokingInviteByUserId[userId] || isRegeneratingInviteByUserId[userId]){
        return [h(SmallLoader)]
      } else {
        return [renderRevoke(), renderRegen()]
      }
    }


  return h.div(".invite-actions", renderContent())
}