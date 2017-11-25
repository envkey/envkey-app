import React from 'react'
import R from 'ramda'
import pluralize from 'pluralize'

const
  orgRoleLabels = {
    org_owner : "Org Owner",
    org_admin: "Org Admin",
    basic: "Org User"
  },
  orgRoleGroupLabels = R.mapObjIndexed(((v, k) => k == "org_owner" ? v : pluralize(v)), orgRoleLabels),
  appRoleLabels = {
    admin: "App Admin",
    production: "App Production",
    development: "App Development"
  },
  appRoleGroupLabels = R.map(pluralize, appRoleLabels)


export const
  imagePath = path => `${process.env.ASSET_HOST}/images/${path}`,

  childrenWithProps = (children, props)=>{
    const propsWithoutChildren = R.omit(["children"], props)
    return React.Children.map(children, child => {
      return React.cloneElement(child, propsWithoutChildren)
    })
  },

  setAuthenticatingOverlay = ()=> {
    if(!document.body.className.includes("preloader-authenticate")){
      document.body.className += " preloader-authenticate"
    }
    document.getElementById("preloader-overlay").className = "full-overlay"
  },

  clearAuthenticatingOverlay = ()=>{
    var overlay = document.getElementById("preloader-overlay")
    if(!overlay.className.includes("hide")){
      overlay.className += " hide"
    }
    document.body.className = document.body.className.replace("no-scroll","")
                                                     .replace("preloader-authenticate","")
  },

  orgRoleLabel = role => orgRoleLabels[role],

  orgRoleGroupLabel = role => orgRoleGroupLabels[role],

  orgRoleIndex = role => R.keys(orgRoleLabels).indexOf(role),

  appRoleLabel = role => appRoleLabels[role] || orgRoleLabels[role],

  appRoleGroupLabel = role => appRoleGroupLabels[role] || orgRoleGroupLabels[role],

  appRoleIndex = role => R.keys(appRoleLabels).indexOf(role)