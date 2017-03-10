import React from 'react'
import {Link} from 'react-router'
import R from 'ramda'
import {imagePath} from 'lib/ui'

const config = {
  environments: ["environments", "Environments", 34, 26],
  collaborators: ["collaborators", "Collaborators", 30.8, 39.6, {objectPermissionPath: ["appUsers", "read"]}],
  // servers: ["servers", "Servers", 34, 39, {objectPermissionPath: ["servers", "read"]}],
  keys: ["keys", "Keys", 49.275, 23.625],
  integration: ["integration", "Integrate", 52, 25],
  settings: ["settings", "Settings", 33, 33, {objectPermissionPath: ["updateSettings"]}],
  apps: ["apps", "Applications", 36, 32],
  billing: ["billing", "Billing", 0, 0]
}

const SelectedTabs = ({tabs, path, selectedTab, permissions, objectPermissions})=>{
  const renderTab = ([action, label, imgW, imgH, {permissionPath, objectPermissionPath}={}], i)=>{
    const selected = action == selectedTab,
          className = [("tab-" + action), (selected ? "selected" : "")].join(" "),
          hasPermission =
            !((permissionPath && (!permissions || !R.path(permissionPath, permissions))) ||
              (objectPermissionPath && (!objectPermissions || !R.path(objectPermissionPath, objectPermissions))))

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