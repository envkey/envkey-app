import React from 'react'
import {Link} from 'react-router'
import {imagePath, orgRoleLabel} from 'lib/ui'

const AccountMenu = ({
  currentUser,
  currentOrg,
  route,
  params,
  isLoadingAppState,
  onToggleExpanded,
  logout
})=>{

  const renderMenuRow = (label, path, img, onClick)=>{
    return <Link to={path}
                 onClick={onClick}
                 className={label.split(" ").join("-").toLowerCase() +
                           (route.path == path ? " selected" : "")}>
            <img src={imagePath(img)} />
            <span>{label}</span>
          </Link>
  }

  const renderBody = ()=>{
    if (isLoadingAppState){
      return <h4> Loading... </h4>
    } else {
      return <div>
          <section className="basic-menu">
          <div className="row-top">
            <span className="col-left user">
              <label>{[currentUser.firstName, currentUser.lastName].join(" ")}</label>
            </span>
            <span className="col-right role">
              <label>{orgRoleLabel(currentUser.role)}</label>
            </span>
          </div>
          <div className="row-bottom">
            <span className="col-left org">
              <label>{currentOrg.name}</label>
            </span>
            <span className="col-right expand"
                  onClick={e => onToggleExpanded()}>
              <img src={imagePath("gear-white.png")} />
            </span>
          </div>
        </section>
        <section className="expanded-menu">
          {currentUser.role == "org_owner" ? renderMenuRow("My Organization",
                                                           `/${params.orgSlug}/my_org/settings`,
                                                           "briefcase-black.png") :
                                              ""}

          {renderMenuRow("My Account",
                         `/${params.orgSlug}/my_account/settings`,
                         "keyhole-black.png")}

          {renderMenuRow("Change Organization",
                         "/select_org",
                         "refresh-black.png")}

          {renderMenuRow("Sign Out",
                         "/sign_out",
                         "signout-black.png",
                         e => {
                          e.preventDefault()
                          logout()
                         })}
        </section>
      </div>
    }
  }

  return <div className="account-menu">
    {renderBody()}
  </div>
}

export default AccountMenu