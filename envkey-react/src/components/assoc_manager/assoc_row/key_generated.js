import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import copy from 'lib/ui/copy'

export default class KeyGenerated extends React.Component {

  constructor(props){
    super(props)
    this.state = { copied: false }
  }

  _kvPair(){
    return `ENVKEY=${[this.props.envkey, this.props.passphrase].join("-")}`
  }

  _kvTruncated(){
    return this._kvPair().slice(0, 20) + "…"
  }

  _onCopy(){
    const res = copy(this._kvPair(), {message: "Copy the text below with #{key}"})
    if (res){
      this.setState({copied: true})
    }
  }

  _onIntegrationQuickstart(e){
    if(shell){
      e.preventDefault()
      shell.openExternal(e.target.href)
    }
  }

  render(){
    return h.div(".key-generated", [
      h.span(".close", {onClick: this.props.onClose}, "⨉"),
      h.div(".top-row", [
        h.span(".primary", this._kvTruncated()),
        h.button(".copy", {onClick: ::this._onCopy}, "Copy"),
        (this.state.copied ? h.span(".copied", "Key copied.") : "")
      ]),
      h.div(".bottom-row", [
        h.p([
          "Key generated. "
        ].concat(
          {
            server: [
              "Copy and set it as an",
              h.strong(" environment variable"),
              " on your server. Don't share it or store it anywhere else."
            ],

            localKey: [
              "Copy it into a",
              h.strong(" .env file"),
              " at the root of your project directory.",
              " This file should be",
              h.strong(" ignored "),
              " in git, svn, mercurial, etc."
            ]
          }[this.props.joinType])
        ),

        h.a({
          href: "https://docs.envkey.com/integration-quickstart.html",
          target: "__blank",
          onClick: ::this._onIntegrationQuickstart
        }, "Integration quickstart ‣")
      ])
    ])
  }

}