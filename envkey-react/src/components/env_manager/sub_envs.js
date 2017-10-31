import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import LabelRow from './label_row'
import SubEnvForm from './sub_env_form'
import SubEnvsList from './sub_envs_list'
import SubEnvGrid from './sub_env_grid'

const envWithMeta = props => props.envsWithMeta[props.environment],

      subEnvs = props => envWithMeta(props)["@@__sub__"] || {},

      subEnvsReadOnly = props => props.app.role == "development",

      varsReadOnly = props => props.app.role == "development" && props.environment == "production"

export default class SubEnvs extends React.Component {
  constructor(props){
    super(props)
  }

  _defaultSelectedId(props){
    return R.path([0, "@@__id__"], this._sortedSubEnvs(props || this.props))
  }

  _selected(props){
    const sel = (props || this.props).params.sel
    if (sel == "first"){
      return this._defaultSelectedId(props)
    } else if (sel == "add") {
      return null
    } else {
      return sel
    }
  }

  _isAddingSubEnv(props){
    return (props || this.props).params.sel == "add"
  }

  _envWithMeta(){
    return envsWithMeta(this.props)
  }

  _subEnvs(props){
    return subEnvs(props || this.props)
  }

  _sortedSubEnvs(props){
    const obj = this._subEnvs(props)
    if (R.isEmpty(obj))return []
    return R.pipe(
      R.toPairs,
      R.map(([id, subEnv])=> ({...subEnv, "@@__id__": id})),
      R.sort(R.ascend(
        R.pipe(R.prop("@@__name__"), R.toLower)
      ))
    )(obj)
  }

  _selectedSubEnv(){
    if(!this._selected())return null
    const subEnv = this._subEnvs()[this._selected()]
    return {...subEnv, "@@__id__": this._selected()}
  }

  _subEnvsReadOnly(){
    return subEnvsReadOnly(this.props)
  }

  _varsReadOnly(){
    return varsReadOnly(this.props)
  }

  _addSubEnv(params){
    this.setState({addedSubEnv: true}, ()=> this.props.addSubEnv(params))
  }

  _classNames(){
    return [
      this.props.environment,
      subEnvsReadOnly(this.props) ? "subenvs-read-only" : "",
      varsReadOnly(this.props) ? "subenv-vars-read-only" : ""
    ]
  }

  render(){
    return h.div(".sub-envs", {className: this._classNames().join(" ")}, [
      this._renderLabelRow(),
      this._renderContent()
    ])
  }

  _renderLabelRow(){
    return h(LabelRow, {
      ...this.props,
      isSubEnvsLabel: true,
      environments: [this.props.environment]
    })
  }

  _renderContent(){
    const content = R.isEmpty(this._subEnvs()) ?
      [this._renderPlaceholder()] :
      [this._renderList(), this._renderSelected()]

    return h.div(".content", content)
  }

  _renderPlaceholder(){
    return h.div(".placeholder", [
      <p className="copy"><strong>Sub-environments</strong> allow for additional environments on top of Development, Staging, and Production by setting new variables and/or overriding existing ones.</p>,

      this._renderSubEnvForm()
    ])
  }

  _renderList(){
    return h(SubEnvsList, {
      ...this.props,
      subEnvs: this._sortedSubEnvs(),
      selected: this._selected(),
      isReadOnly: this._subEnvsReadOnly(),
      isAddingSubEnv: this._isAddingSubEnv()
    })
  }

  _renderSelected(){
    return this._isAddingSubEnv() ? this._renderAddForm() : this._renderGrid()
  }

  _renderAddForm(){
    if (!this._subEnvsReadOnly()){
      return h.div(".add-sub-env-form", [this._renderSubEnvForm()])
    }
  }

  _renderSubEnvForm(){
    if(!this._subEnvsReadOnly()){
      return h(SubEnvForm, {
        ...this.props,
        addSubEnv: ::this._addSubEnv
      })
    }
  }

  _renderGrid(){
    if (this._selectedSubEnv()){
      return h(SubEnvGrid, {
        ...this.props,
        isReadOnly: this._varsReadOnly(),
        subEnv: this._selectedSubEnv()
      })
    }
  }
}