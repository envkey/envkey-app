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

  isElementInViewport = el => {
    const rect = el.getBoundingClientRect()

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    )
  },

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

  openLinkExternal = e => {
    if(window.shell){
      e.preventDefault()
      window.shell.openExternal(e.target.href)
    }
  },

  orgRoleLabel = role => orgRoleLabels[role],

  orgRoleGroupLabel = role => orgRoleGroupLabels[role],

  orgRoleIndex = role => R.keys(orgRoleLabels).indexOf(role),

  appRoleLabel = role => appRoleLabels[role] || orgRoleLabels[role],

  appRoleGroupLabel = role => appRoleGroupLabels[role] || orgRoleGroupLabels[role],

  appRoleIndex = role => R.keys(appRoleLabels).indexOf(role),

  envCellDomId = R.pipe(
    R.props(["entryKey", "environment", "subEnvId"]),
    R.filter(Boolean),
    R.join("-")
  )
