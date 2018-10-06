import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

export default function ({
  assoc: {id: userId, relation: {accessStatus: {status}}},
  revokeInvite,
  regenInvite
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
      return [renderRevoke(), renderRegen()]
    }


  return h.div(".invite-actions", renderContent())
}