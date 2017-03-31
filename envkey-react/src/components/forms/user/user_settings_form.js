import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'
import OrgUserForm from './org_user_form'
import UserDetails from './user_details'
import DeleteField from '../shared/delete_field'

export default function({
  user,
  isRemoving,
  isUpdatingOrgRole,
  onRemove,
  onUpdateOrgRole,
  orgRolesAssignable
}){
  const
    renderDelete = ()=>{
      if (user.orgUser.permissions.delete){

        return h.div(".danger-zone", [
          h.h3("Danger Zone"),

          h(DeleteField, {
            fullLabel: "Remove From Organization",
            isRemoving,
            onRemove,
            confirmName: [user.firstName, user.lastName].join(" "),
            confirmPrompt: "the user's full name"
          })
        ])

      }
    },

    renderOrgUserForm = ()=> {
      if (user.orgUser.permissions.delete){
        return h(OrgUserForm, {
          orgUser: user.orgUser,
          orgRolesAssignable,
          isSubmitting: isUpdatingOrgRole,
          onSubmit: onUpdateOrgRole
        })
      }
    }

  return h.div(".user-settings", [
    h(UserDetails, user),

    renderOrgUserForm(),

    renderDelete()
  ])
}