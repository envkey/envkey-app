import React from 'react'
import {Link} from 'react-router'
import R from 'ramda'
import {imagePath} from 'lib/ui'

const config = {
  variables: ["variables", "Variables", 34, 26],
  collaborators: ["collaborators", "Collaborators", 30.8, 39.6, {objectPermissionPath: ["appUser", "read"]}],
  keys: ["keys", "EnvKeys", 49.275, 23.625],
  versions: ["versions", "Versions", 40, 38.3],
  logs: ["logs", "Logs", 36, 33.7],
  settings: ["settings", "Settings", 33, 33, {objectPermissionPath: ["updateSettings"]}],
  apps: ["apps", "Apps", 36, 32],
  firewall: ["firewall", "Firewall", 28, 34, {objectPermissionPath: ["updateNetworkSettings"]}],
  billing: ["billing", "Billing", 34, 23, {
    permissionFn: R.complement(R.prop('isDemo')),
    objectPermissionPath: ["updateBilling"]
  }]
}

const SelectedTabs = (props)=>{
  const {tabs, path, selectedTab, permissions, objectPermissions, isDemo} = props

  const renderTab = ([action, label, imgW, imgH, {permissionPath, objectPermissionPath, permissionFn}={}], i)=>{
    const selected = selectedTab.indexOf(action) == 0,
          className = [("tab-" + action), (selected ? "selected" : "")].join(" ")

    let hasPermission = true
    if (permissionPath && (!permissions || !R.path(permissionPath, permissions))){
      hasPermission = false
    }
    if (objectPermissionPath && (!objectPermissions || !R.path(objectPermissionPath, objectPermissions))){
      hasPermission = false
    }
    if (permissionFn && !permissionFn(props)){
      hasPermission = false
    }

    if (hasPermission){
      return <Link key={i}
                   className={`tab-${className}`}
                   to={[path, action].join("/")} >
        <span>
          <img src={imagePath(`${action}.png`)}
               width={imgW * 0.87}
               height={imgH * 0.87} />
          <label>{label}</label>
        </span>
      </Link>
    }
  }

  return <div className="app-tabs">
    {R.pipe(
       R.pick(tabs),
       R.values
     )(config).map(renderTab)}
  </div>
}

export default SelectedTabs