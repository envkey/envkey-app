// Based on https://github.com/neodon/react-multiselect

import React from 'react'
import Filter from './filter'

var MultiSelectItem = React.createClass({
  getDefaultProps: function() {
    return {
      visible: true,
      selected: false,
      text: '',
      onClick: function() {}
    }
  },
  render: function() {
    return this.props.visible && <li
      className={this.props.selected ? 'selected' : 'deselected'}
      onClick={this.props.onClick}
    >
      <input type="checkbox" checked={this.props.selected} />
      <span className="primary">{this.props.text}</span>
    </li>
  }
})

var MultiSelect = React.createClass({
  getDefaultProps: function() {
    return {
      items: [],
      placeholder: 'Enter some filter text',
      onChange: function() {},
      onItemSelected: function() {},
      onItemDeselected: function() {}
    }
  },
  getInitialState: function() {
    return {
      selections: {},
      filter: ''
    }
  },
  handleItemClick: function(item) {
    this.setSelected(item, !this.state.selections[item.id])
  },
  onFilter: function(val) {
    // Keep track of every change to the filter input
    this.setState({ filter: val })
  },
  escapeRegExp: function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },
  createItem: function(item) {
    // Filter item visibility based on the filter input
    var regex = new RegExp('.*'+this.escapeRegExp(this.state.filter)+'.*', 'i')
    var text = 'text' in item ? item.text
             : 'name' in item ? item.name
             : item.id
    return <MultiSelectItem
      key={item.id}
      text={item.label || item.text}
      onClick={this.handleItemClick.bind(this, item)}
      visible={regex.test(text)}
      selected={this.state.selections[item.id] ? true : false}
    />
  },
  selectAll: function(event) {
    this.setSelected(this.props.items, true)
  },
  selectNone: function(event) {
    this.setSelected(this.props.items, false)
  },
  setSelected: function(items, selected) {
    // Accept an array or a single item
    if (!(items instanceof Array)) items = [items]

    var selections = this.state.selections
    for (var i in items) {
      selections[items[i].id] = selected

      if (selected)
        this.props.onItemSelected(items[i])
      else
        this.props.onItemDeselected(items[i])
    }
    this.setState({ selections: selections })
    this.props.onChange(selections)
  },
  getSelected: function(){
    var ids = []
    for (var id in this.state.selections){
      if(this.state.selections[id])ids.push(id)
    }
    return ids
  },

  render: function() {
    return (
      <div className="multi-select">
        <Filter onFilter={this.onFilter} value={this.state.filter} placeholder={this.props.placeholder || "Filter candidates..."} />
        <ul>{this.props.items.map(this.createItem)}</ul>
      </div>
    )
  }
})

export default MultiSelect
