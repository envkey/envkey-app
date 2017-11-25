import React from 'react'
import {Link} from 'react-router'
import {imagePath, orgRoleLabel} from 'lib/ui'

const AccountMenu = ({
  currentUser,
  currentOrg,
  numOrgs,
  router,
  params,
  isOpen,
  onToggle,
  logout
})=>{

  const
    renderMenuRow = (label, path, img, onClick)=>{
      return <Link to={path}
                   onClick={onClick}
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

    renderMenuBody = ()=>{
      if (isOpen){
        return <section className="menu-body">
          <div className="account-menu-back" onClick={e => onToggle()}>
            <i className="img">←</i>
            <span>Back</span>
          </div>

          {currentUser.role == "org_owner" ? renderMenuRow("My Organization",
                                                           `/${params.orgSlug}/my_org`,
                                                           "briefcase-black.png") :
                                              ""}

          {renderMenuRow("My Account",
                         `/${params.orgSlug}/my_account/settings`,
                         "keyhole-black.png")}

          {renderMenuRow("Switch Organization",
                         "/select_org",
                         "refresh-black.png")}

          {renderMenuRow("Switch Account",
                         "/select_account",
                         "refresh-black.png")}

          {renderMenuRow("Accept Invitation",
                         "/accept_invite",
                         "airplane-black.svg")}

          {renderMenuRow("Sign Out",
                         "/sign_out",
                         "signout-black.png",
                         e => {
                          e.preventDefault()
                          logout()
                         })}
        </section>
      }
    }

  return <div className="account-menu">
    {renderMenuHeader()}
    {renderMenuBody()}
  </div>
}



export default AccountMenu