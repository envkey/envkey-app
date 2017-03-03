import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'
import UserForm from './user_form'
import DeleteField from '../shared/delete_field'

export default function({
  currentUser,
  isRemoving,
  isUpdatingSettings,
  onRemove,
  onUpdateSettings
}){

  return h.div(".user-settings.my-account-settings", [
    h(UserForm, {
      user: currentUser,
      orgRolesAssignable: [],
      isSubmitting: isUpdatingSettings,
      onSubmit: onUpdateSettings
    }),

    h(DeleteField, {label: "My Account", isRemoving, onRemove})
  ])
}