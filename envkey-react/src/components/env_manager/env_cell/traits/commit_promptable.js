import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

let showedCommitPrompt = false // just using a dirty dirty global to show prompt once per session only

const CommitPromptable = Editable => class extends Editable {

  constructor(props){
    super(props)

    this.state = {
      ...(this.state || {}),
      showCommitPrompt: false
    }
  }

  _onEdit(){
    super._onEdit()
    if(!showedCommitPrompt)this._flashCommitPrompt()
  }

  _flashCommitPrompt(){
    this.setState({showCommitPrompt: true})
    setTimeout(this.setState.bind(this, {showCommitPrompt: false}), 3000)
    showedCommitPrompt = true
  }

  _renderCellContents(){
    return this.props.isEditing ?
      super._renderCellContents().concat([this._renderCommitPrompt()]) :
      super._renderCellContents()
  }

  _renderCommitPrompt(){
    const className = "commit-prompt " + (this.state.showCommitPrompt ? "show" : "")

    return h.div({className}, [
      h.div(".col-left",[
        h.span([h.em("esc"), " to cancel"])
      ]),
      h.div(".col-right", [
        h.span([h.em("enter"), " to commit"])
      ])
    ])
  }
}

export default CommitPromptable

