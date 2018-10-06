import React from 'react'
import ReactDOM from 'react-dom'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import moment from 'moment'
import scrollIntoView from 'scroll-into-view'
import EntryRow from './entry_row'
import EditableCellsParent from './traits/editable_cells_parent'
import {toClass} from 'recompose'
import { allEntries } from "envkey-client-core/dist/lib/env/query"
import ConfigBlock from './config_block'

const HIGHLIGHT_ROW_DELAY = 2000

export default class EnvGridContent extends EditableCellsParent(React.Component) {

  constructor(props){
    super(props)
    this.state = {
      editing: {},
      highlightRows: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lastAddedEntry != nextProps.lastAddedEntry){
      if (nextProps.lastAddedEntry){
        const {entryKey, timestamp} = nextProps.lastAddedEntry,
              diff = moment().valueOf() - timestamp

        if (diff < 1000){
          this.setState(R.assocPath(["highlightRows", entryKey], true))

          setTimeout(()=> {
            this.setState(R.dissocPath(["highlightRows", entryKey]))
          }, HIGHLIGHT_ROW_DELAY)
        }

      } else {
        this.setState({highlightRows: {}})
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.highlightRows){
      const keysAdded = R.difference(
                          R.keys(this.state.highlightRows),
                          R.keys(prevState.highlightRows)
                        )

      if (keysAdded.length){
        const key = R.last(keysAdded),
              row = ReactDOM.findDOMNode(this.refs[`row-${key}`])

        scrollIntoView(row, {time: 150, align: {top: 0, topOffset: 210}})
      }
    }
  }

  _deselect(){
    super._deselect()
    this.props.stoppedEditing()
  }

  _onEditCell(entryKey, environment, subEnvId, isMultiline){
    this.setState({editing: {entryKey, environment, subEnvId}})
    this.props.editCell(entryKey, environment, subEnvId, isMultiline)
  }

  _onCommitEntryVal(entryKey, environment, update){
    this._clearEditing()
    this.props.updateEntryVal({entryKey, environment, update, subEnvId: this.props.subEnvId})
  }

  _onCommitEntry(entryKey, update){
    this._clearEditing()
    this.props.updateEntry({entryKey, update, ...R.pick(["subEnvId", "parentEnvironment"], this.props)})
  }

  render(){
    return h.div(".grid-content", [
      this._renderSocketAddingEntries(),
      this._renderConfigBlocks(),
      this._renderEntryRows()
    ])
  }

  _renderSocketAddingEntries(){
    const socketAddingEntries = this.props.socketAddingEntry[this.props.subEnvId || "@@__base__"] || []

    return h.div(".socket-adding-entries-block", socketAddingEntries.map(({firstName, lastName})=>{
      return h.div([
        h.span(".name", [firstName, lastName].join(" ")),
        h.span(" is adding a variable")
      ])
    }))
  }

  _renderEntryRows(){
    return h.div(".vars-block", [
      h.div(".entry-rows", allEntries(this.props.envsWithMeta).map(::this._renderEntryRow))
    ])
  }

  _renderEntryRow(entryKey){
    const filter = this.props.filter
    if(filter && !entryKey.toLowerCase().includes(filter))return
    if(this.props.editingMultilineEntryKey){
      if(this.props.editingMultilineEntryKey != entryKey)return
    }
    return h(toClass(EntryRow), {
      entryKey,
      ...this.props,
      key: entryKey,
      ref: `row-${entryKey}`,
      highlightRow: Boolean(this.state.highlightRows[entryKey]),
      editing: this.state.editing,
      socketUserEditingEntry: R.path([entryKey, this.props.subEnvId || "@@__base__"], this.props.socketEditingEntry),
      socketUserRemovingEntry: R.path([entryKey, this.props.subEnvId || "@@__base__"], this.props.socketRemovingEntry),
      onEditCell: ::this._onEditCell,
      onCommitEntry: ::this._onCommitEntry,
      onCommitEntryVal: ::this._onCommitEntryVal,
    })
  }

  _renderConfigBlocks(){
    if(this.props.parentType == "app" && !this.props.subEnvId && this.props.configBlocks && this.props.configBlocks.length){
      return h.div(".blocks", this.props.configBlocks.map(::this._renderConfigBlock))
    }
  }

  _renderConfigBlock(block, i){
    const filter = this.props.filter,
          entries = allEntries(block.envsWithMeta),
          toCheck = [block.name].concat(entries).map(s => s.toLowerCase())
    if(filter && !R.any(R.contains(filter), toCheck))return
    return h(ConfigBlock, {
      ...this.props,
      entries,
      isRemoving: this.props.isRemovingById[block.relation.id],
      block,
      key: i
    })
  }
}

