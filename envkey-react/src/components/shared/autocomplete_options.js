import React from 'react'
import {optIndex} from 'lib/env/autocomplete'

export default class AutocompleteOptions extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      selectedIndex: this._defaultIndex(props)
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.searchStr != this.props.searchStr){
      this.setState({selectedIndex: this._defaultIndex(nextProps)})
    }
  }

  select(){
    this._onSelect(this.props.opts[this.state.selectedIndex])
  }

  prev(){
    this.setState(state => ({selectedIndex: Math.max(-1, state.selectedIndex - 1)}))
  }

  next(){
    this.setState(state => ({selectedIndex: Math.min(this.props.opts.length - 1, this.state.selectedIndex + 1)}))
  }

  hasSelection(){
    return this.state.selectedIndex >= 0
  }

  _defaultIndex(props){
    const i = optIndex(this.props.searchStr, props.opts)
    if (i > -1){
      return i
    } else if (props.searchStr) {
      return 0
    } else {
      return -1
    }
  }

  _onSelect({val, selectedInherits}){
    this.props.onSelect({val, selectedInherits})
  }

  _onMouseOver(i){
    this.setState({selectedIndex: i})
  }

  _onOptionsMouseOut(){
    this.setState({selectedIndex: -1})
  }

  render(){
    return (
      <div className="autocomplete-options"
           onMouseOut={::this._onOptionsMouseOut}>
        {this.props.opts.map(::this._renderAutoCompleteOption)}
      </div>
    )
  }

  _renderAutoCompleteOption({val, label, prefix, isSpecial, className, selectedInherits}, i){
    const prefixEl = prefix ? <small className="prefix">{prefix}</small> : "",
          labelEl = isSpecial ? <small>{label}</small> : <span>{label}</span>
    return (
      <div key={i}
           className={["opt", className].join(" ") + (i == this.state.selectedIndex ? " selected" : "")}
           onClick={this._onSelect.bind(this,{val, selectedInherits})}
           onMouseOver={this._onMouseOver.bind(this,i)}>
        <span>
          {prefixEl}
          {labelEl}
        </span>
      </div>
    )
  }

}