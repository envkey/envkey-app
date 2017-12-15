import React from 'react'
import R from 'ramda'
import h from 'lib/ui/hyperscript_with_helpers'
import {Link} from 'react-router'
import Spinner from 'components/shared/spinner'
import {OnboardOverlay} from 'components/onboard'
import {imagePath} from 'lib/ui'

export default function ({orgs, currentOrg, isFetchingOrg, onSelect}){

  console.log(orgs)

  const
    renderSelectButton = (org)=>{
      return <button onClick={e => onSelect(org.slug)}> Select </button>
    },

    renderOrg = (org, i)=> {
      return <div key={i || false} className={i % 2 == 0 ? "even" : "odd"}>
        <label>{org.name}</label>
        {renderSelectButton(org)}
      </div>
    },

    renderOrgSelect = ()=> {
      if(isFetchingOrg){
        return <Spinner />
      } else if (orgs.length){
        return <div className="select-candidates org-candidates">{orgs.map(renderOrg)}</div>
      } else {
        return <div className="no-orgs">
          <p>You don't currently belong to any organizations.</p>
        </div>
      }
    },

    renderCreateOrg = ()=> {
      return <Link to="/create_org" className="button secondary-button create-org">
        <img src={imagePath("plus-sign-blue.svg")} />
        <label>Create New Organization</label>
      </Link>
    },

    // renderAcceptInvite = ()=> {
    //   return <Link to="/accept_invite" className="button secondary-button accept-invite">
    //     <img src={imagePath("airplane-blue.svg")} />
    //     <label>Accept An Invitation</label>
    //   </Link>
    // },

    renderBackLink = ()=> {
      return h(Link, {className: "back-link", to: "/home"}, [
        h.span(".img", "←"),
        h.span("Back To Home")
      ])
    }

  return <OnboardOverlay>
    <div className="onboard-auth-form select-org">
      <h1>Select An <em>Organization</em></h1>
      {renderOrgSelect()}
      {renderCreateOrg()}
      {renderBackLink()}
    </div>
  </OnboardOverlay>

}