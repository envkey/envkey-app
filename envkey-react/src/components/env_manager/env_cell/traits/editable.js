import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

const defaultInputVal = props => props.inherits || props.val || ""

const Editable = Cell => class extends Cell {

  constructor(props) {
    super(props)

    this.state = {
      ...this.state,
      showCommitPrompt: false,
      inputVal: defaultInputVal(props)
    }
  }

  componentDidMount(){
    if(this.props.isEditing)this._setTextSelected()
  }

  componentDidUpdate(prevProps, prevState){
    if(super.componentDidUpdate)super.componentDidUpdate(prevProps, prevState)
    if(prevProps.isEditing == false && this.props.isEditing){
      this._setTextSelected()
    }
  }

  componentWillReceiveProps(nextProps){
    if(super.componentWillReceiveProps)super.componentWillReceiveProps(nextProps)
    if (!nextProps.isEditing && !nextProps.isUpdating){
      this.setState({inputVal: defaultInputVal(nextProps)})
    }
  }

  _onEdit(){
    this.props.onEditCell(this.props.entryKey, this.props.environment)
    if(this.props.needsCommitPrompt)this._flashCommitPrompt()
  }

  _onInputChange(e){
    this.setState({inputVal: this._transformInputVal(e.target.value)})
  }

  _transformInputVal(val){ return val }

  _onInputKeydown(e){
    if(e.key == "Enter"){
      this._handleEnter(e)
    } else if (e.key == "ArrowUp"){
      this._handleUpArrow(e)
    } else if (e.key == "ArrowDown"){
      this._handleDownArrow(e)
    }
  }

  _setTextSelected(){
    this.refs.input.focus()
    this.refs.input.select()
  }

  _inputPlaceholder(){ return "" }

  _handleEnter(e){
    e.preventDefault()
    this._commit({val: this.state.inputVal, inherits: null})
  }

  _handleUpArrow(){}

  _handleDownArrow(){}

  _flashCommitPrompt(){
    this.setState({showCommitPrompt: true})
    setTimeout(this.setState.bind(this, {showCommitPrompt: false}), 2500)
  }

  _commit(update){}

  _actions(){
    return super._actions().concat([
      {type: "edit", onClick: ::this._onEdit, img: "edit-circle-black.png"},
    ])
  }

  _classNames(){
    return super._classNames().concat([
      (this.props.isEditing ? "editing": "")
    ])
  }

  _renderCellContents(){
    const base = (this.props.isEditing ? [this._renderInput()] : super._renderCellContents())
    return base.concat([
      this._renderCommitPrompt()
    ])
  }

  _renderInput(){
    return h.input(".cell-input", {
      ref: "input",
      placeholder: this._inputPlaceholder(),
      value: this.state.inputVal,
      onChange: ::this._onInputChange,
      onKeyDown: ::this._onInputKeydown
    })
  }

  _renderCommitPrompt(){
    if (this.state.showCommitPrompt){
      const className = "commit-prompt " + (this.state.showCommitPrompt ? "show" : "")

      return h.div({className}, [
        h.div(".col-left",[
          h.span([h.em("esc"), "to cancel"]),
          h.span([h.em("enter"), "to commit"])
        ])
      ])
    }
  }
}

export default Editable