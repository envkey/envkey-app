import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'
import BasicRenameForm from '../shared/basic_rename_form'
import DeleteField from '../shared/delete_field'

export default function({
  currentOrg,
  isRenaming,
  isRemoving,
  isUpdatingSettings,
  onRename,
  onRemove,
  onUpdateSettings
}){
const label = "Organization"

  return h.div(".org-settings", [
    h(BasicRenameForm, {label, isRenaming, onRename, name: currentOrg.name}),
    h.div(".danger-zone", [
      h.h3("Danger Zone"),
      h.div(".content", [
        h.fieldset(".delete-org", [
          h.label("Delete Organization"),
          h(DeleteField, {label, isRemoving, onRemove, confirmName: currentOrg.name})
        ])
      ])
    ])
  ])
}