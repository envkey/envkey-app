import React from 'react'
import ReactDOM from 'react-dom'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import {isElementInViewport} from 'lib/ui'
import {getAutocompleteOpts} from 'lib/env/autocomplete'
import {inheritedVal} from  'lib/env/inheritance'
import AutocompleteOptions from 'components/shared/autocomplete_options'

const Autocompletable = Editable => class extends Editable {

  constructor(props){
    super(props)
    this.state = this.state || {}
    this.state.selectedInherits = Boolean(this.props.inherits)
  }

  componentDidUpdate(prevProps, prevState){
    if(super.componentDidUpdate)super.componentDidUpdate(prevProps, prevState)

    if(this.props.isEditing && this._autocompleteOpts().length){
      let node = ReactDOM.findDOMNode(this.refs.autocompleteOptions)

      if(node && !isElementInViewport(node)){
        node.scrollIntoView()
      }
    }
  }

  _onAutocompleteSelect({val, selectedInherits}){
    let inputVal = val || ""

    this.setState({inputVal, selectedInherits})

    let commitVal = (typeof val === "undefined" ? inputVal : val),
        update = selectedInherits ?
          {
            inherits: commitVal,
            val: null,
            inheritedVal: inheritedVal({
              ...R.pick(["entryKey", "envsWithMeta"], this.props),
              inherits: commitVal
            })
          } :

          {val: commitVal, inherits: null}

    this._commit(update)
  }

  _handleEnter(e){
    if(this.refs.autocompleteOptions &&
       this.refs.autocompleteOptions.hasSelection()){
      e.preventDefault()
      this.refs.autocompleteOptions.select()
    } else {
      super._handleEnter(e)
    }
  }

  _handleUpArrow(e){
    if(this.refs.autocompleteOptions){
      e.preventDefault()
      this.refs.autocompleteOptions.prev()
    } else {
      super._handleUpArrow(e)
    }
  }

  _handleDownArrow(e){
    if(this.refs.autocompleteOptions){
      e.preventDefault()
      this.refs.autocompleteOptions.next()
    } else {
      super._handleDownArrow(e)
    }
  }

  _autocompleteOpts(){
    return getAutocompleteOpts(this.props, this._searchStr())
  }

  _searchStr(){
    if (this.state.inputVal == "" && this.props.val == ""){
      return ""
    } else if (this.state.inputVal){
      return this.state.inputVal.trim().toLowerCase()
    } else {
      return null
    }
  }

  _renderCellContents(){
    return super._renderCellContents().concat([
      this._renderAutocompleteOptions()
    ])
  }

  _renderAutocompleteOptions(){
    if(!this.props.isEditing)return
    const opts = this._autocompleteOpts()

    if (opts.length){
      return h(AutocompleteOptions, {
        opts,
        ref: "autocompleteOptions",
        searchStr: this._searchStr(),
        onSelect: ::this._onAutocompleteSelect
      })
    }
  }
}

export default Autocompletable