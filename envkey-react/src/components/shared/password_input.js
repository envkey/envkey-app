import React from 'react'

export default class PasswordInput extends React.Component {

  val(){
    return this.refs.input.value
  }

  focus(){
    this.refs.input.focus()
  }

  render(){
    return <input {...this.props}
                  ref="input"
                  type="password"
                  placeholder="Your master encryption passphrase (10-256 characters)"
                  pattern=".{10,256}"
                  required />

  }
}