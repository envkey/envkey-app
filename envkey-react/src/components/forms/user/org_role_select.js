import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import {orgRoleLabel} from 'lib/ui'

export default function({
  value,
  onChange,
  orgRolesAssignable
}){

  const renderRoleOption = (orgRole, i)=> {
    return h.option({key: i, value: orgRole}, orgRoleLabel(orgRole))
  }

  return h.fieldset(".org-role-select", [
    h.label("Organization Role"),
    h.select(
      ".org-role",
      {value, onChange},
      orgRolesAssignable.map(renderRoleOption)
    )
  ])
}

