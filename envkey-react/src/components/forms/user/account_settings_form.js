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
      onSubmit: onUpdateSettings,
      readOnlyEmail: true
    }),

    h.div(".danger-zone", [
      h.h3("Danger Zone"),
      h(DeleteField, {
        label: "Your Account",
        isRemoving,
        onRemove,
        confirmName: [currentUser.firstName, currentUser.lastName].join(" "),
        confirmPrompt: "your full name"
      })
    ])
  ])
}