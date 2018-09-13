import React from 'react'
import {Link} from 'react-router'
import {imagePath, orgRoleLabel} from 'lib/ui'
import {orgRoleIsAdmin, orgRoleIsOwner} from 'lib/roles'

const AccountMenu = ({
  currentUser,
  currentOrg,
  numOrgs,
  isDemo,
  router,
  params,
  isOpen,
  onToggle,
  logout,
  resetSession
})=>{

  const
    renderMenuRow = (label, path, img, opts={})=>{
      return <Link to={opts.disabled ? "" : path}
                   onClick={opts.disabled ? "" : opts.onClick}
                   disabled={opts.disabled || false}
                   className={label.split(" ").join("-").toLowerCase() +
                             (router.location.pathname.includes(path) ? " selected" : "")}>
              <img src={imagePath(img)} />
              <span>{label}</span>
            </Link>
    },

    renderMenuHeader = ()=> {
      return <section className="basic-menu">
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
          <span className="col-right toggle"
                onClick={e => onToggle()}>
            <img src={imagePath("gear-white.png")} />
          </span>
        </div>
      </section>
    },

    myOrgIndexRoute = ()=> {
      if (currentOrg.permissions.updateSettings){
        return "settings"
      } else if (currentOrg.permissions.updateNetworkSettings){
        return "firewall"
      } else if (currentOrg.permissions.updateBilling){
        return "billing"
      }
    },

    renderMenuBody = ()=>{
      if (isOpen){
        return <section className="menu-body">
          <div className="account-menu-back" onClick={e => onToggle()}>
            <i className="img">←</i>
            <span>Back</span>
          </div>

          <div className="spacer"/>

          {orgRoleIsAdmin(currentUser.role) ? renderMenuRow("My Organization",
                                                           `/${params.orgSlug}/my_org/${myOrgIndexRoute()}`,
                                                           "briefcase-black.png") :
                                              ""}

          {renderMenuRow("My Account",
                         `/${params.orgSlug}/my_account/settings`,
                         "keyhole-black.png")}

          <div className="spacer"/>

          {renderMenuRow("Switch Organization",
                         "/select_org",
                         "refresh-black.png",
                         {disabled: isDemo})}

          {renderMenuRow("Switch Account",
                         "/select_account",
                         "refresh-black.png",
                         {onClick: e => resetSession(), disabled: isDemo})}

          {renderMenuRow("Accept Invitation",
                         "/accept_invite",
                         "airplane-black.svg",
                         {onClick: e => resetSession(), disabled: isDemo})}

          <div className="spacer"/>

          {renderMenuRow("Sign Out",
                         "/sign_out",
                         "signout-black.png",
                         {onClick: e => {
                          e.preventDefault()
                          logout()
                         }, disabled: isDemo})}
        </section>
      }
    }

  return <div className="account-menu">
    {renderMenuHeader()}
    {renderMenuBody()}
  </div>
}



export default AccountMenu