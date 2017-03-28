import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

const PROMPT_FADE_DELAY = 5000

const CommitPromptable = Editable => class extends Editable {

  constructor(props){
    super(props)

    this.state = {
      ...(this.state || {}),
      showCommitPrompt: false,
      showedPrompt: false
    }
  }

  _onEdit(){
    super._onEdit()
    this.setState({showCommitPrompt: false, showedPrompt: false})
  }

  _onInputChange(e){
    super._onInputChange(e)
    if(!this.state.showedPrompt)this._flashCommitPrompt()
  }

  _flashCommitPrompt(){
    this.setState({showCommitPrompt: true, showedPrompt: true})
    setTimeout(this.setState.bind(this, {showCommitPrompt: false}), PROMPT_FADE_DELAY)
  }

  _renderCellContents(){
    return this.props.isEditing ?
      super._renderCellContents().concat([this._renderCommitPrompt()]) :
      super._renderCellContents()
  }

  _renderCommitPrompt(){
    const className = "commit-prompt " + (this.state.showCommitPrompt ? "show" : "")

    if (className.endsWith("show")){
      console.log(className)
    }

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

