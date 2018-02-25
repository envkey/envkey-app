import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'
import UserDetails from './user_details'
import DeleteField from '../shared/delete_field'
import {UpdatePasswordFormContainer} from 'containers'

export default function({
  currentUser,
  isRemoving,
  onRemove
}){

  const
    renderDangerZone = ()=> {
      if (!currentUser.demo){
        return h.div(".danger-zone", [
          h.h3("Danger Zone"),
          h.div(".content", [
            h.fieldset(".delete-account", [
              h.label("Delete Account"),
              h(DeleteField, {
                label: "Your Account",
                isRemoving,
                onRemove,
                confirmName: [currentUser.firstName, currentUser.lastName].join(" "),
                confirmPrompt: "your full name"
              })
            ])
          ])
        ])
      }
    },

    renderUpdatePassword = ()=> {
      if (!currentUser.demo){
        return h(UpdatePasswordFormContainer)
      }
    }

  return h.div(".user-settings.my-account-settings", [
    h(UserDetails, currentUser),

    renderUpdatePassword(),

    renderDangerZone()
  ])
}