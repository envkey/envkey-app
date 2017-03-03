import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import moment from 'moment'
import copy from 'copy-to-clipboard'
import {imagePath} from "lib/ui"
import {capitalize} from "lib/utils/string"
import SmallLoader from 'components/shared/small_loader'

export default function ({
  assocType,
  parentType,
  keyLabel,
  onRenew,
  isRemoving,
  isGeneratingAssocKey,
  isCurrentUser=false,
  keyGeneratedAt,
  keyGeneratedById,
  envkey,
  passphrase
}){
  const canGenerate = ()=> !isRemoving,

        renderRenew = ()=> {
          if (isRemoving)return ""
          if (isGeneratingAssocKey){
            return h(SmallLoader)
          } else if (canGenerate()) {
            return h.button(".renew",{onClick: onRenew}, keyGeneratedAt ? "Renew Envkey" : "Generate Envkey")
          }
        },

        renderKeyLabel = ()=> {
          if (envkey && passphrase){
            return h.span(".key-label", [
              h.span(".secondary", [envkey, passphrase].join("-")),
            ])
          } else if (keyGeneratedAt){
            return h.span(".key-label", [
              h.span(".secondary", `${keyLabel ? capitalize(keyLabel) : ""} key`),
              h.span(".key-date", moment(keyGeneratedAt).format('YYYY-MM-DD'))
            ])
          } else {
            return h.span(".key-label", [
              h.span(".secondary", "No key generated")
            ])
          }
        }

  return h.div(".keyable-actions",[
    h.div(".key-info", [
      h.img(".key-icon",{src: imagePath("envkey-small-icon-black.png")}),
      renderKeyLabel()
    ]),
    h.div(".actions", [
      renderRenew()
    ])
  ])

}