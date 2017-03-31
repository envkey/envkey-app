import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import DevKeyRow from './assoc_row/dev_key_row'

export default function(props) {
  return h.div(".dev-key-manager", [h(DevKeyRow, props)])
}