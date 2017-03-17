import React from 'react'

export default class PasswordInput extends React.Component {

  val(){
    return this.refs.input.value
  }

  focus(){
    this.refs.input.focus()
  }

  render(){
    return <input ref="input"
                  type="password"
                  placeholder="Your password (10-256 characters)"
                  pattern=".{10,256}"
                  required />

  }
}