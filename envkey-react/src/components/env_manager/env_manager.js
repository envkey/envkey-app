import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import EnvHeader from './env_header'
import EnvGrid from './env_grid'
import SubEnvs from './sub_envs'
import {AddAssoc} from 'components/assoc_manager'
import SmallLoader from 'components/shared/small_loader'
import { allEntries, hasAnyVal } from 'lib/env/query'
import traversty from 'traversty'

export default class EnvManager extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      hideValues: true,
      filter: "",
      showFilter: false,
      lastSocketUserUpdatingEnvs: null
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

  _subEnvsOpen(props){
    if(!props)props = this.props
    return (props.envsWithMeta && props.params.sub) || false
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
      (this.props.didOnboardImport ? "did-onboard-import" : "")
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
      onFilter: filter => this.setState({filter}),
      onToggleFilter: () => {
        this.setState({filter: "", showFilter: !this.state.showFilter}, ()=>{
          const input = traversty(".env-header .filter input")[0]
          if(this.state.showFilter){
            input.focus()
          } else {
            input.blur()
          }
        })
      },
      onToggleHideValues: ()=> this.setState(state => ({hideValues: !state.hideValues})),
    })
  }

  _renderGrid(){
    return h(EnvGrid, {
      ...this.props,
      ...R.pick(["hideValues", "startedOnboarding", "filter"], this.state)
    })
  }

  _renderSubEnvs(){
    return h(SubEnvs, {
      ...this.props,
      ...R.pick(["hideValues", "filter"], this.state),
      environment: this._subEnvsOpen()
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

