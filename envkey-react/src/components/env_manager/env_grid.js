import React from 'react'
import ReactDOM from 'react-dom'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import moment from 'moment'
import scrollIntoView from 'scroll-into-view'
import EntryRow from './entry_row'
import LabelRow from './label_row'
import ServiceBlock from './service_block'
import EditableCellsParent from './traits/editable_cells_parent'
import EntryForm from './entry_form'
import {toClass} from 'recompose'

const HIGHLIGHT_ROW_DELAY = 2000

export default class EnvGrid extends EditableCellsParent(React.Component) {

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

  _onEditCell(entryKey, environment){
    this.setState({editing: {entryKey, environment}})
    this.props.editCell(entryKey, environment)
  }

  _onCommitEntryVal(entryKey, environment, update){
    this._clearEditing()
    this.props.updateEntryVal(entryKey, environment, update)
  }

  _onCommitEntry(entryKey, update){
    this._clearEditing()
    this.props.updateEntry(entryKey, update)
  }

  render(){
    return h.div(".grid.env-grid", [
      h(LabelRow, this.props),
      this._renderAddVar(),
      h.div(".grid-content", [
        this._renderSocketAddingEntries(),
        this._renderEntryRows(),
        this._renderServiceBlocks()
      ])
    ])
  }

  _renderSocketAddingEntries(){
    return h.div(".socket-adding-entries-block", this.props.socketAddingEntry.map(({firstName, lastName})=>{
      return h.div([
        h.span(".name", [firstName, lastName].join(" ")),
        h.span(" is adding a variable")
      ])
    }))
  }

  _renderEntryRows(){
    return h.div(".vars-block", [
      h.div(".entry-rows", this.props.entries.map(::this._renderEntryRow))
    ])
  }

  _renderEntryRow(entryKey){
    const filter = this.props.filter
    if(filter && !entryKey.toLowerCase().includes(filter))return
    return h(toClass(EntryRow), {
      entryKey,
      ...this.props,
      key: entryKey,
      ref: `row-${entryKey}`,
      highlightRow: Boolean(this.state.highlightRows[entryKey]),
      editing: this.state.editing,
      socketUserEditingEntry: this.props.socketEditingEntry[entryKey],
      socketUserRemovingEntry: this.props.socketRemovingEntry[entryKey],
      onEditCell: ::this._onEditCell,
      onCommitEntry: ::this._onCommitEntry,
      onCommitEntryVal: ::this._onCommitEntryVal,
    })
  }

  _renderServiceBlocks(){
    if(this.props.parentType == "app"){
      return h.div(".service-blocks", this.props.services.map(::this._renderServiceBlock))
    }
  }

  _renderServiceBlock(service, i){
    const filter = this.props.filter,
          entries = this.props.entriesByServiceId[service.id],
          toCheck = [service.name].concat(entries).map(s => s.toLowerCase())
    if(filter && !R.any(R.contains(filter), toCheck))return
    return h(ServiceBlock, {
      ...this.props,
      isUpdatingService: this.props.isRemovingServiceFn(service.relation.id),
      service,
      key: i
    })
  }

  _renderAddVar(){
    if (this.props.addVar){
      return h(EntryForm, {
        ...this.props,
        onSubmit: this.props.createEntry
      })
    }
  }
}

