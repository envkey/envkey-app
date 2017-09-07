import React from 'react'
import Spinner from 'components/shared/spinner'
import {OnboardOverlay} from 'components/onboard'

export default function ({orgs, currentOrg, isFetchingOrg, onSelect}){

  const renderSelectButton = (org)=>{
    return <button onClick={e => onSelect(org.slug)}> Select </button>
  }

  const renderOrg = (org, i)=> {
    return <div key={i || false} className={i % 2 == 0 ? "even" : "odd"}>
      <label>{org.name}</label>
      {renderSelectButton(org)}
    </div>
  }

  const renderOrgSelect = ()=> {
    if(isFetchingOrg){
      return <Spinner />
    } else {
      return <div className="org-candidates">{orgs.map(renderOrg)}</div>
    }
  }

  return <OnboardOverlay>
    <div className="onboard-auth-form select-org">
      <h1><em>Select An Organization</em></h1>
      {renderOrgSelect()}
    </div>
  </OnboardOverlay>

}