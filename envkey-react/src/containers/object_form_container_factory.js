import React from 'react'
import { connect } from 'react-redux'
import h from "lib/ui/hyperscript_with_helpers"
import {createObject} from 'actions'
import {getIsCreating, getOrgRolesAssignable} from 'selectors'
import {AppForm, ServiceForm, UserForm} from 'components/forms'

const ObjectFormContainerFactory = ({objectType})=> {

  const
    formClass = { app: AppForm, service: ServiceForm, user: UserForm }[objectType],

    ObjectFormContainer = props => h.div(".new-page", [h(formClass, props)]),

    mapStateToProps = (state, ownProps) => {
      const props = {isSubmitting: getIsCreating({objectType}, state)}
      if(objectType == "user"){
        props.orgRolesAssignable = getOrgRolesAssignable(state)
      }
      return props
    },

    mapDispatchToProps = (dispatch, ownProps) => ({
      onSubmit: params => dispatch(createObject({objectType, params}))
    })

  return connect(mapStateToProps, mapDispatchToProps)(ObjectFormContainer)
}

export default ObjectFormContainerFactory