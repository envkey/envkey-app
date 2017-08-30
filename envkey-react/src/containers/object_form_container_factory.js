import React from 'react'
import R from 'ramda'
import { connect } from 'react-redux'
import h from "lib/ui/hyperscript_with_helpers"
import {
  createObject,
  billingUpgradeSubscription
} from 'actions'
import {
  getIsCreating,
  getOrgRolesAssignable,
  getCurrentOrg,
  getApps,
  getOrgOwner
} from 'selectors'
import {AppForm, UserForm} from 'components/forms'

const ObjectFormContainerFactory = ({objectType})=> {

const
  formClass = { app: AppForm, user: UserForm }[objectType],

  ObjectFormContainer = props => h.div(".new-page", [h(formClass, props)]),

  mapStateToProps = (state, ownProps) => {
    const props = {
      isSubmitting: getIsCreating({objectType}, state),
      currentOrg: getCurrentOrg(state),
      numApps: getApps(state).length,
      orgOwner: getOrgOwner(state)
    }

    if(objectType == "user"){
      props.orgRolesAssignable = getOrgRolesAssignable(state)
    }

    if(objectType == "app"){
      props.renderImporter = true
      props.environments = ["development", "staging", "production"]
    }

    return props
  },

  mapDispatchToProps = (dispatch, ownProps) => ({
    onSubmit: params => {
      dispatch(createObject({
        objectType,
        params: (params.params || params),
        toImport: params.toImport
      }))
    },
    onUpgradeSubscription: ()=> dispatch(billingUpgradeSubscription())
  })

  return connect(mapStateToProps, mapDispatchToProps)(ObjectFormContainer)
}

export default ObjectFormContainerFactory