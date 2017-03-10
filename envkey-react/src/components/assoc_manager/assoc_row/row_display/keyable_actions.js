import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import {twitterShortTs} from 'lib/utils/date'
import copy from 'copy-to-clipboard'
import {imagePath} from "lib/ui"
import {capitalize} from "lib/utils/string"
import SmallLoader from 'components/shared/small_loader'

export default function ({
  assocType,
  parentType,
  keyLabel,
  onRenew,
  onRevoke,
  isRemoving,
  getUserFn,
  isGeneratingAssocKey,
  isCurrentUser=false,
  keyGeneratedAt,
  keyGeneratedById,
  envkey,
  passphrase
}){
  const
    canGenerate = ()=> !isRemoving,

    renderUpdateButtons = ()=> h.div(".update-buttons", [
        h.button(".revoke", {
          onClick: onRevoke
        }, "Revoke"),

        renderGenerateButton()
    ]),

    renderGenerateLabel = ()=> keyGeneratedAt ? "Renew" : "Generate",

    renderGenerateButton = ()=> h.button(".renew",{
      onClick: onRenew
    }, renderGenerateLabel()),

    renderButtons = ()=> {
      if (isRemoving)return ""
      if (isGeneratingAssocKey){
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
      } else if (keyGeneratedAt){
        const {firstName, lastName} = getUserFn(keyGeneratedById),
              fullName = [firstName, lastName].join(" ")
        contents = [
          h.span(".secondary", `${fullName} `),
          h.span(".key-date", "・ " + twitterShortTs(keyGeneratedAt))
        ]
      } else {
        contents = [
          h.span(".secondary", "No key generated")
        ]
      }

      return h.span(".key-label", contents)
    }

  return h.div(".keyable-actions",[
    h.div(".key-info", [
      h.img(".key-icon",{src: imagePath("envkey-small-icon-black.png")}),
      renderKeyLabel()
    ]),
    h.div(".actions", [
      renderButtons()
    ])
  ])

}