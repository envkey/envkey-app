import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import {Link} from 'react-router'
import { createOrg } from 'actions'
import {OnboardOverlay} from 'components/onboard'
import OrgForm from 'components/forms/org/org_form'

const CreateOrg = (props)=>{
  const renderBackLink = ()=> h(Link, {className: "back-link", to: "/home"}, [
    h.span(".img", "←"),
    h.span("Back To Home")
  ])

  return <OnboardOverlay>
    <div className="onboard-auth-form create-org">
      <h1>Create An <em>Organization</em></h1>
      <OrgForm {...props} />
      {renderBackLink()}
    </div>
  </OnboardOverlay>
}

const
  mapStateToProps = (state, ownProps) => ({
    isSubmitting: state.isCreatingOrg
  }),

  mapDispatchToProps = dispatch => ({
    onSubmit: params => {
      if(!document.body.className.includes("preloader-authenticate")){
        document.body.className += " preloader-authenticate"
      }
      document.getElementById("preloader-overlay").className = "full-overlay"
      dispatch(createOrg(params))
    }
  })


export default connect(mapStateToProps, mapDispatchToProps)(CreateOrg)

