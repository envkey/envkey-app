import React from 'react'
import R from 'ramda'
import pluralize from 'pluralize'

export const isElementInViewport = el => {
  const rect = el.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
  )
}

export const imagePath = path => `${process.env.ASSET_HOST}/images/${path}`

export const childrenWithProps = (children, props)=>{
  return React.Children.map(children, child => {
    return React.cloneElement(child, props)
  })
}

const orgRoleLabels = {
        org_owner : "Org Owner",
        service_admin: "Service Admin",
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
  orgRoleLabel = role => orgRoleLabels[role],

  orgRoleGroupLabel = role => orgRoleGroupLabels[role],

  appRoleLabel = role => appRoleLabels[role] || orgRoleLabels[role],

  appRoleGroupLabel = role => appRoleGroupLabels[role] || orgRoleGroupLabels[role]