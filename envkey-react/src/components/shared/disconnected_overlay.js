import React from 'react'
import {imagePath} from "lib/ui"

export default function(){
  return <div className="full-overlay disconnected-overlay">
    <div className="connection-info">
      <div className="logo">
        <img src={imagePath("envkey-logo.svg")} />
      </div>
      <h3>EnvKey can't connect to the internet. </h3>
      <p>A connection is required to ensure you're always in sync.<br/> The app will reload automatically when a connection is re-established.</p>

    </div>
  </div>
}