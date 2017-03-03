import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import KeyableActions from "./keyable_actions"

export default function ({parentType,
                          assocType,
                          onRenew,
                          isRemoving,
                          isGeneratingAssocKey,
                          assoc: {
                            name,
                            envkey,
                            createdAt,
                            keyGeneratedAt,
                            keyGeneratedById,
                            passphrase
                          },
                          config: {keyLabel}}){

  return h.div([
    h.div(".top-row", [
      h.span(".primary", name)
    ]),

    h.div(".bottom-row", [
      h(KeyableActions, {
        parentType,
        assocType,
        keyLabel,
        onRenew,
        isRemoving,
        isGeneratingAssocKey,
        keyGeneratedAt,
        keyGeneratedById,
        envkey,
        passphrase,
        createdAt
      })
    ])
  ])

}