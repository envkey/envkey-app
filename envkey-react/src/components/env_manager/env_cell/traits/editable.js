import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import {isMultiline} from "envkey-client-core/dist/lib/utils/string"

const defaultInputVal = props => props.inherits || props.val || ""

const Editable = (Cell, editableOpts={}) => class extends Cell {

  constructor(props) {
    super(props)

    this.state = {
      ...(this.state || {}),
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
    if ((!nextProps.isEditing && !nextProps.isUpdating) || this.props.val != nextProps.val){
      this.setState({inputVal: defaultInputVal(nextProps)})
    }
  }

  _isMultiline(){
    const inputVal = this.state.inputVal || "",
          singleLineMax = this.props.subEnvId ? 80 : 40

    return editableOpts.multiline && isMultiline(inputVal, singleLineMax)
  }

  _onEdit(){
    this.props.onEditCell(this.props.entryKey, this.props.environment, this.props.subEnvId, this._isMultiline())
  }

  _onInputChange(e){
    this.setState({
      inputVal: this._transformInputVal(e.target.value)
    }, ()=> {
      this._onEdit(false)
    })
  }

  _transformInputVal(val){ return val }

  _onInputKeydown(e){
    if(e.key == "Enter" && !e.shiftKey){
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
    this.refs.input.scrollTop = 0
  }

  _inputPlaceholder(){ return "" }

  _handleEnter(e){
    e.preventDefault()
    this._commit({val: this.state.inputVal, inherits: null})
  }

  _handleUpArrow(){}

  _handleDownArrow(){}

  _commit(update){}

  _actions(){
    return super._actions().concat([
      {type: "edit", onClick: ::this._onEdit, img: "edit-circle-black.png"},
    ])
  }

  _classNames(){
    return super._classNames().concat([
      (this.props.isEditing ? "editing": ""),
      (this._isMultiline() ? "multiline" : "")
    ])
  }

  _renderCellContents(){
    return this.props.isEditing ? [this._renderInput()] : super._renderCellContents()
  }

  _renderInput(){
    const inputParams = {
            ref: "input",
            spellCheck: "false",
            placeholder: this._inputPlaceholder(),
            value: this.state.inputVal,
            onChange: ::this._onInputChange,
            onKeyDown: ::this._onInputKeydown
          },
          component = editableOpts.multiline ? h.textarea : h.input

    return component(".cell-input", inputParams)
  }


}

export default Editable