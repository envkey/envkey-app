import React from 'react'

import h from "lib/ui/hyperscript_with_helpers"

export default function({confirmText,
                         onConfirm,
                         onCancel,
                         cancelLabel="Cancel",
                         confirmLabel="Confirm"}) {

  return h.div(".confirm-action", [
    h.span(confirmText),
    h.div(".actions", [
      h.button(".cancel", {onClick: onCancel}, cancelLabel),
      h.button(".confirm", {onClick: onConfirm}, confirmLabel)
    ])
  ])

}