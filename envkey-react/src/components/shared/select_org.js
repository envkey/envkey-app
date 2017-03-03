import React from 'react'

export default function ({orgs, currentOrg, isFetchingOrg, onSelect}){

  const renderSelectButton = (org)=>{
    return <button onClick={e => onSelect(org.slug)}> Select </button>
  }

  const renderOrg = (org, i)=> {
    return <div key={i || false}>
      <label>{org.name}</label>
      {renderSelectButton(org)}
    </div>
  }

  const renderOrgSelect = ()=> {
    if(isFetchingOrg){
      return <h3>Loading...</h3>
    } else {
      return <div className="org-candidates">{orgs.map(renderOrg)}</div>
    }
  }

  return <div className="select-org">
    <h4>Select An Org</h4>
    {renderOrgSelect()}
  </div>

}