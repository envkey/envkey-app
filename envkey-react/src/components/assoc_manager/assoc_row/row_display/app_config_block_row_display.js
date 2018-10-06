import React from 'react'

export default function ({assoc: {name}}){
  return <div>
    <div className="top-row">
      <span className="primary">{name}</span>
    </div>
  </div>
}