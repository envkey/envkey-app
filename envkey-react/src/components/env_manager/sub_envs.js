import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import LabelRow from './label_row'
import SubEnvForm from './sub_env_form'
import SubEnvsList from './sub_envs_list'
import SubEnvGrid from './sub_env_grid'

const envWithMeta = props => props.parent.envsWithMeta[props.environment],

      subEnvs = props => envWithMeta(props)["@@__sub__"] || {}

export default class SubEnvs extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      selected: R.path([0, "@@__id__"], this._sortedSubEnvs()),
      isAddingSubEnv: false
    }
  }

  componentWillReceiveProps(nextProps) {
    const lastKeys = R.keys(subEnvs(this.props)),
          newKeys = R.keys(subEnvs(nextProps)),
          diff = R.difference(newKeys, lastKeys)

    if (diff.length){
      this.setState({selected: diff[0], isAddingSubEnv: false})
    }
  }

  _envWithMeta(){
    return envsWithMeta(this.props)
  }

  _subEnvs(){
    return subEnvs(this.props)
  }

  _sortedSubEnvs(){
    const obj = this._subEnvs()
    if (R.isEmpty(obj))return []
    return R.pipe(
      R.toPairs,
      R.map(([id, subEnv])=> ({...subEnv, "@@__id__": id})),
      R.sort(R.ascend(R.prop("@@__name__")))
    )(obj)
  }

  _selectedSubEnv(){
    if(!this.state.selected)return null
    const subEnv = this._subEnvs()[this.state.selected]
    return {...subEnv, "@@__id__": this.state.selected}
  }

  _onAddSubEnv(e){
    e.preventDefault()
    this.props.onAddSubEnv()
  }

  render(){
    return h.div(".sub-envs", [
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
      <p className="copy"><strong>Sub-environments</strong> allow you to create additional environments on top of Development, Staging, and Production by adding additional variables and/or overriding existing ones.</p>,

      h(SubEnvForm, this.props)
    ])
  }

  _renderList(){
    return h(SubEnvsList, {
      ...this.props,
      subEnvs: this._sortedSubEnvs(),
      onAddSubEnv: ()=> this.setState({selected: null, isAddingSubEnv: true}),
      onSelect: id => this.setState({selected: id, isAddingSubEnv: false})
    })
  }

  _renderSelected(){
    return this.state.isAddingSubEnv ? this._renderAddForm() : this._renderGrid()
  }

  _renderAddForm(){
    return h.div(".add-subenv-form", [
      h(SubEnvForm, this.props)
    ])
  }

  _renderGrid(){
    if (this._selectedSubEnv()){
      return h(SubEnvGrid, {
        ...this.props,
        subEnv: this._selectedSubEnv()
      })
    }
  }
}