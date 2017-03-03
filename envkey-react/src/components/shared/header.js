import React from 'react'
import { Link } from 'react-router'
import { imagePath } from 'lib/ui'

const Header = ()=>{

  return <header className="main-header">
    <div className="logo">
      <Link to="/">
        <img src={imagePath("envkey-logo.png")}/>
      </Link>
    </div>

    <span className="line" />
  </header>

}

export default Header