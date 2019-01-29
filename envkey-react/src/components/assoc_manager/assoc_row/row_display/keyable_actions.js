import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import {twitterShortTs} from 'envkey-client-core/dist/lib/utils/date'
import {imagePath} from "lib/ui"
import {capitalize} from "envkey-client-core/dist/lib/utils/string"
import SmallLoader from 'components/shared/small_loader'
import KeyIcon from "components/shared/key_icon"

export default function ({
  onRenew,
  onRevoke,
  isRemoving,
  getUserFn,
  isGeneratingAssocKey,
  isRevokingAssocKey,
  keyGeneratedAt,
  keyGeneratedById,
  envkeyShort,
  permissions,
  isCurrentUser=false,
  currentUser
}){
  const
    canGenerate = ()=> permissions.generateKey && !isRemoving,

    renderUpdateButtons = ()=> h.div(".update-buttons", [
        renderRevokeButton(),
        renderGenerateButton()
    ]),

    renderGenerateLabel = ()=> keyGeneratedAt ? "Renew" : "Generate",

    renderGenerateButton = ()=> h.button(".renew",{
      onClick: onRenew
    }, renderGenerateLabel()),

    renderRevokeButton = ()=> {
      return h.button(".revoke", {
        onClick: onRevoke
      }, "Revoke")
    },

    renderButtons = ()=> {
      if (isRemoving)return ""
      if (isGeneratingAssocKey || isRevokingAssocKey){
        return h(SmallLoader)
      } else if (canGenerate()) {
        if (keyGeneratedAt){
          return renderUpdateButtons()
        } else {
          return renderGenerateButton()
        }
      }
    },

    renderKeyLabel = ()=> {
      let contents

      if (isGeneratingAssocKey){
        contents = [
          h.span(".secondary", "Generating key...")
        ]
      } else if (isRevokingAssocKey){
        contents = [
          h.span(".secondary", "Revoking key...")
        ]
      } else if (keyGeneratedAt){
        const user = isCurrentUser ? currentUser : getUserFn(keyGeneratedById),
              name = user ? [user.firstName[0] + ".", user.lastName].join(" ") : "[deleted]"
        contents = [
          h.span(".envkey-short", [h.strong(envkeyShort + "…")]),
          h.span(".secondary", `・ ${name} `),
          h.span(".key-date", "・ " + twitterShortTs(keyGeneratedAt))
        ]
      } else {
        contents = [
          h.span(".secondary", "No envkey generated")
        ]
      }

      return h.span(".key-label", contents)
    }

  return h.div(".keyable-actions", {
    className: [
      (keyGeneratedAt ? "has-key" : ""),
      (isGeneratingAssocKey ? "generating-key" : "")
    ].join(" ")

  },[
    h.div(".key-info", [
      h(KeyIcon),
      renderKeyLabel()
    ]),
    h.div(".actions", [
      renderButtons()
    ])
  ])

}