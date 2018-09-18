import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import EnvHeader from './env_header'
import EnvGrid from './env_grid'
import SubEnvs from './sub_envs'
import {AddAssoc} from 'components/assoc_manager'
import SmallLoader from 'components/shared/small_loader'
import Filter from 'components/shared/filter'
import { allEntries, hasAnyVal } from "envkey-client-core/dist/lib/env/query"
import traversty from 'traversty'

const subEnvsReadOnly = props => props.app.role == "development",

      subEnvVarsReadOnly = props => props.app.role == "development" && props.environment == "production"

export default class EnvManager extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      hideValues: true,
      filter: "",
      showFilter: false,
      lastSocketUserUpdatingEnvs: null,
      editingMultilineEnvironment: null,
      editingMultilineEntryKey: null
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.socketUserUpdatingEnvs &&
       nextProps.socketUserUpdatingEnvs != this.state.lastSocketUserUpdatingEnvs){
      this.setState({lastSocketUserUpdatingEnvs: nextProps.socketUserUpdatingEnvs})
    }


    if (R.path(["parent", "id"], this.props) != R.path(["parent", "id"], nextProps) ||
        this._subEnvsOpen(this.props) != this._subEnvsOpen(nextProps) ||
        (this._subEnvsOpen() && this.props.params.sel != nextProps.params.sel)){
      this.setState({showFilter: false, filter: ""})
    }
  }

  _onToggleFilter(){
    this.setState({filter: "", showFilter: !this.state.showFilter}, ()=>{
      const input = traversty(".environments .filter input")[0]
      if(this.state.showFilter){
        input.focus()
      } else {
        input.blur()
      }
    })
  }

  _onEditCell(entryKey, environment, subEnvId, isMultiline, isEntryForm){
    if (isMultiline){
      this.setState({
        editingMultilineEntryKey: entryKey,
        editingMultilineEnvironment: environment
      })
    } else {
      this.setState({
        editingMultilineEntryKey: null,
        editingMultilineEnvironment: null
      })
    }
    if (!isEntryForm){
      this.props.editCell(entryKey, environment, subEnvId)
    }
  }

  _onStoppedEditing(isEntryForm){
    this.setState({
      editingMultilineEntryKey: null,
      editingMultilineEnvironment: null
    })

    if (!isEntryForm){
      this.props.stoppedEditing()
    }
  }

  _onUpdateEntryVal(params){
    this.setState({
      editingMultilineEntryKey: null,
      editingMultilineEnvironment: null
    })

    if (!params.isEntryForm){
      this.props.updateEntryVal(params)
    }
  }

  _subEnvsOpen(props){
    if(!props)props = this.props
    return (props.envsWithMeta && props.params.sub) || false
  }

  _subEnvsReadOnly(props){
    if(!props)props = this.props
    return subEnvsReadOnly(props)
  }

  _subEnvVarsReadOnly(props){
    if(!props)props = this.props
    return subEnvVarsReadOnly({...props, environment: this._subEnvsOpen()})
  }

  _isEmpty(arg=null){
    const props = arg || this.props
    return allEntries(props.envsWithMeta).length == 0
  }

  _classNames(){
    return [
      "environments",
      [this.props.parentType, "parent"].join("-"),
      (this.props.isUpdatingEnv ? "updating-env" : ""),
      (this._isEmpty() ? "empty" : ""),
      (this.state.hideValues ? "hide-values" : ""),
      (hasAnyVal(this.props.envsWithMeta) ? "" : "has-no-val"),
      (this.props.socketUserUpdatingEnvs ? "receiving-socket-update" : ""),
      (this.props.didOnboardImport ? "did-onboard-import" : ""),
      (this.state.showFilter ? "show-filter" : ""),
      (this.state.editingMultilineEnvironment ? "editing-multiline" : ""),
      (this.state.editingMultilineEnvironment && !this.state.editingMultilineEntryKey ? "editing-multiline-entry-form" : ""),
      (this.state.editingMultilineEnvironment && this.state.editingMultilineEntryKey ? "editing-multiline-grid" : ""),
      (this._subEnvsOpen() ? "sub-envs-open" : ""),
      (this._subEnvsReadOnly() ? "subenvs-read-only" : ""),
      (this._subEnvVarsReadOnly() ? "subenv-vars-read-only" : "")
    ]
  }

  render(){
    if (!this.props.parent){
      return <div></div>
    }

    return h.div({className: this._classNames().join(" ")}, this._renderContents())
  }

  _renderContents(){
    return [
      this._renderHeader(),
      this._renderFilter(),
      (this._subEnvsOpen() ? this._renderSubEnvs() : this._renderGrid()),
      this._renderSocketUpdate()
    ]
  }

  _renderHeader(){
    return h(EnvHeader, {
      ...this.props,
      ...R.pick(["hideValues", "filter", "showFilter"], this.state),
      subEnvsOpen: this._subEnvsOpen(),
      isEmpty: this._isEmpty(),
      onToggleHideValues: ()=> this.setState(state => ({hideValues: !state.hideValues})),
    })
  }

  _renderFilter(){
    const envsWithMeta = this.props.envsWithMeta,
          subEnvsOpen = this._subEnvsOpen(),
          subEnvsEmpty = subEnvsOpen && R.isEmpty(envsWithMeta[subEnvsOpen]["@@__sub__"] || {}),
          subEnvsAdding = subEnvsOpen && this.props.params.sel == "add"

    if (!subEnvsEmpty && !subEnvsAdding && !(subEnvsOpen && this._subEnvVarsReadOnly())){
      return h(Filter, {
        onFilter: filter => this.setState({filter}),
        onToggleFilter: ::this._onToggleFilter,
        value: this.state.filter,
        placeholder: "Filter by variable name…",
        onKeyDown: (e)=> {
          if (e.keyCode == 27){ // escape key
            this._onToggleFilter()
          }
        }
      })
    }
  }

  _renderGrid(){
    return h(EnvGrid, {
      ...this.props,
      ...R.pick([
        "hideValues",
        "startedOnboarding",
        "filter",
        "editingMultilineEntryKey",
        "editingMultilineEnvironment"
      ], this.state),
      editCell: ::this._onEditCell,
      stoppedEditing: ::this._onStoppedEditing,
      updateEntryVal: ::this._onUpdateEntryVal
    })
  }

  _renderSubEnvs(){
    const environment = this._subEnvsOpen()
    return h(SubEnvs, {
      ...this.props,
      ...R.pick([
        "hideValues",
        "filter",
        "editingMultilineEntryKey",
        "editingMultilineEnvironment"
      ], this.state),
      environment,
      editCell: ::this._onEditCell,
      stoppedEditing: ::this._onStoppedEditing,
      updateEntryVal: ::this._onUpdateEntryVal,
      subEnvsReadOnly: this._subEnvsReadOnly(),
      subEnvVarsReadOnly: subEnvVarsReadOnly({...this.props, environment})
    })
  }

  _renderSocketUpdate(){
    const {firstName, lastName} = (this.state.lastSocketUserUpdatingEnvs || {})
    return h.div(".socket-update-envs", [
      h.label([
        h.span("Receiving update from "),
        h.span(".name", [firstName, lastName].join(" "))
      ]),
      h(SmallLoader)
    ])
  }
}

