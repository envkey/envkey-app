import React from 'react'
import { connect } from 'react-redux'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import {
  renameObject,
  removeObject,
  updateObjectSettings,
  updateOrgRole
} from 'actions'
import {
  AppSettingsForm,
  UserSettingsForm,
  OrgSettingsForm,
  AccountSettingsForm,
  ConfigBlockSettingsForm
} from 'components/forms'
import {
  getIsRemoving,
  getIsRenaming,
  getIsUpdatingSettings,
  getIsUpdatingOrgRole,
  getOrgRolesAssignable
} from 'selectors'

const SettingsFormContainerFactory = ({objectType, targetObjectType, targetObjectPath})=> {
  const
    formClass = {
      app: AppSettingsForm,
      configBlock: ConfigBlockSettingsForm,
      user: UserSettingsForm,
      currentOrg: OrgSettingsForm,
      currentUser: AccountSettingsForm
    }[objectType]

  const
    SettingsFormContainer = props => h.div(".settings", [h(formClass, props)]),

    mapStateToProps = (state, ownProps) => {
      const obj = ownProps[objectType],
            target = targetObjectPath ? R.path(targetObjectPath, obj) : obj,
            props = {
              [objectType]: obj,
              isRenaming: getIsRenaming(target.id, state),
              isRemoving: getIsRemoving(target.id, state),
              isUpdatingSettings: getIsUpdatingSettings(target.id, state),
              isUpdatingOrgRole: getIsUpdatingOrgRole(obj.id, state)
            }

      if (objectType == "user"){
        props.orgRolesAssignable = getOrgRolesAssignable(obj.id, state)
      }

      return props
    },

    mapDispatchToProps = (dispatch, ownProps) => {
      const obj = ownProps[objectType],
            {id: targetId} = targetObjectPath ? R.path(targetObjectPath, obj) : obj,
            baseParams = {objectType: targetObjectType || objectType, targetId}
      return {
        onRename: params => dispatch(renameObject({...baseParams, params})),
        onRemove: ()=> dispatch(removeObject(baseParams)),
        onUpdateSettings: params => dispatch(updateObjectSettings({...baseParams, params})),
        onUpdateOrgRole: ({role}) => dispatch(updateOrgRole({role, userId: obj.id, orgUserId: targetId}))
      }
    }

  return connect(mapStateToProps, mapDispatchToProps)(SettingsFormContainer)
}

export default SettingsFormContainerFactory