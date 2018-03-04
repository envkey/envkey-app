import React from "react"
import changes from 'CHANGELOG.json'


export default function({version}){

  const renderChange = (change, i) => {
    return <li key={i}>{change}</li>
  }

  return <div className="changelog">
    <ul>{(changes[version] || []).map(renderChange)}</ul>
  </div>

}

