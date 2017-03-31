import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import moment from 'moment'
import EntryRow from './entry_row'
import LabelRow from './label_row'
import ServiceBlock from './service_block'
import EditableCellsParent from './traits/editable_cells_parent'
import EntryForm from './entry_form'

const HIGHLIGHT_ROW_DELAY = 1800

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
        this.setState({highlightRow: null})
      }
    }
  }

  _onEditCell(entryKey, environment){
    this.setState({editing: {entryKey, environment}})
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
        this._renderEntryRows(),
        this._renderServiceBlocks()
      ])
    ])
  }

  _renderEntryRows(){
    return h.div(".vars-block", [
      h.div(".entry-rows", this.props.entries.map(::this._renderEntryRow))
    ])
  }

  _renderEntryRow(entryKey, i){
    const filter = this.props.filter
    if(filter && !entryKey.toLowerCase().includes(filter))return
    return h(EntryRow, {
      key: i,
      highlightRow: Boolean(this.state.highlightRows[entryKey]),
      entryKey,
      ...this.props,
      editing: this.state.editing,
      onEditCell: ::this._onEditCell,
      onCommitEntry: ::this._onCommitEntry,
      onCommitEntryVal: ::this._onCommitEntryVal
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
        parent: this.props.parent,
        isSubmitting: this.props.isCreatingEntry,
        environments: this.props.environments,
        onSubmit: this.props.createEntry
      })
    }
  }
}

