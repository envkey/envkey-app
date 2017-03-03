import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'
import UserForm from './user_form'
import DeleteField from '../shared/delete_field'

export default function({
  user,
  isRemoving,
  isUpdatingSettings,
  onRemove,
  onUpdateSettings,
  orgRolesAssignable
}){
  const renderDelete = ()=>{
    if (user.permissions.delete){
      return h(DeleteField, {label: "User", isRemoving, onRemove})
    }
  }

  return h.div(".user-settings", [
    h(UserForm, {
      user,
      orgRolesAssignable,
      isSubmitting: isUpdatingSettings,
      onSubmit: onUpdateSettings
    }),

    renderDelete()
  ])
}