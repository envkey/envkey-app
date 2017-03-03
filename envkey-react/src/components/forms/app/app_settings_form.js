import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'
import BasicRenameForm from '../shared/basic_rename_form'
import DeleteField from '../shared/delete_field'

export default function({
  app,
  isRenaming,
  isRemoving,
  isUpdatingSettings,
  onRename,
  onRemove,
  onUpdateSettings
}){
  const label = "App"

  return h.div(".app-settings", [
    h(BasicRenameForm, {label, isRenaming, onRename, name: app.name}),
    h(DeleteField, {label, isRemoving, onRemove})
  ])
}