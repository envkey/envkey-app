import React from 'react'
import { connect } from 'react-redux'
import h from "lib/ui/hyperscript_with_helpers"
import {
  renameObject,
  removeObject,
  updateObjectSettings
} from 'actions'
import {
  AppSettingsForm,
  ServiceSettingsForm,
  UserSettingsForm,
  OrgSettingsForm,
  AccountSettingsForm
} from 'components/forms'
import {
  getIsRemoving,
  getIsRenaming,
  getIsUpdatingSettings,
  getOrgRolesAssignable
} from 'selectors'

const SettingsFormContainerFactory = ({objectType})=> {
  const
    formClass = {
      app: AppSettingsForm,
      service: ServiceSettingsForm,
      user: UserSettingsForm,
      currentOrg: OrgSettingsForm,
      currentUser: AccountSettingsForm
    }[objectType]

  const
    SettingsFormContainer = props => h.div(".settings", [h(formClass, props)]),

    mapStateToProps = (state, ownProps) => {
      const obj = ownProps[objectType],
            props = {
              [objectType]: obj,
              isRenaming: getIsRenaming(obj.id, state),
              isRemoving: getIsRemoving(obj.id, state),
              isUpdatingSettings: getIsUpdatingSettings(obj.id, state)
            }

      if (objectType == "user"){
        props.orgRolesAssignable = getOrgRolesAssignable(obj.id, state)
      }

      return props
    },

    mapDispatchToProps = (dispatch, ownProps) => {
      const {id: targetId} = ownProps[objectType],
            baseParams = {objectType, targetId}
      return {
        onRename: params => dispatch(renameObject({...baseParams, params})),
        onRemove: ()=> dispatch(removeObject(baseParams)),
        onUpdateSettings: params => dispatch(renameObject({...baseParams, params}))
      }
    }

  return connect(mapStateToProps, mapDispatchToProps)(SettingsFormContainer)
}

export default SettingsFormContainerFactory