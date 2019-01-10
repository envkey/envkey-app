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

  _onEdit(isInitialEdit=true){
    super._onEdit()
    if (isInitialEdit || (this._isMultiline && this._isMultiline())){
      this.setState({showCommitPrompt: false, showedPrompt: false})
    }
  }

  _onInputChange(e){
    super._onInputChange(e)
    if(!this.state.showedPrompt)this._flashCommitPrompt()
  }

  _flashCommitPrompt(){
    if(this._isMultiline && this._isMultiline()){
      return
    }

    this.setState({showCommitPrompt: true, showedPrompt: true}, ()=>{
      setTimeout(()=>{
        this.setState({showCommitPrompt: false})
      }, PROMPT_FADE_DELAY)
    })
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

