import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import {Link} from "react-router"
import {imagePath} from "lib/ui"
import {ImportEnvContainer, ExportEnvContainer} from 'containers'
import {appRoleIsAdmin} from 'lib/roles'
import isElectron from 'is-electron'

export default class LabelRow extends React.Component {

  constructor(props){
    super(props)
    this.state = { menuOpen: null, importOpen: null, exportOpen: null }
  }

  _locked(environment){
    return this.props.parent.role == "development" && environment == "production"
  }

  _hasSubEnvs(environment){
    return !R.isEmpty(R.pathOr({}, [environment, "@@__sub__"], this.props.envsWithMeta))
  }

  _onToggleMenuFn(environment){
    return ()=> {
      this.setState({
        menuOpen: (environment == this.state.menuOpen ? null : environment)
      })
    }
  }

  render(){
    return h.div(".row.label-row", [
      h.div(".cols", this.props.environments.map(::this._renderEnvLabel))
    ])
  }

  _renderEnvLabel(environment, i){
    return h.div(".label-cell", {
      key: i,
      className: `env-${environment} ${this._locked(environment) ? 'locked' : ''} ${environment == this.state.menuOpen ? 'menu-open' : ''}`
    }, [
      this._renderSubEnvsAction(environment),
      h.label([
        this._locked(environment) ? h.img(".img-locked", {src: imagePath("padlock.svg")}) : "",
        h.strong(environment)
      ]),
      this._renderActionsToggle(environment),
      this._renderActionsMenu(environment),

      this._renderImporterModal(environment),
      this._renderExporterModal(environment)
    ])
  }

  _renderSubEnvsAction(environment){
    const {parent, location, params, isSubEnvsLabel} = this.props

    if (!(parent.role == "development" && !this._hasSubEnvs(environment))){
      if (isSubEnvsLabel){
        return h(Link, {className: "close-subenvs", to: location.pathname.replace(new RegExp(`/${params.sub}/.*$`), "")}, [
          h.i("←")
        ])
      } else {
        return h(Link, {className: "open-subenvs", to: location.pathname + `/${environment}/first`}, [
          h.img({src: imagePath("subenvs-zoom-white.svg")})
        ])
      }
    }
  }

  _renderActionsToggle(environment){
    if (!this._locked(environment) && !this.props.isSubEnvsLabel){
      return h.span(".toggle-menu", {onClick: this._onToggleMenuFn(environment)}, [
        h.i(["..."])
      ])
    }
  }

  _renderActionsMenu(environment){

    return h.ul(".actions-menu", [

      // h.li([h.span("Versions")]),

      h.li({
        onClick: e => this.setState({importOpen: environment, menuOpen: null})
      },[h.span("Import")]),

      this._renderExportAction(environment)

    ])
  }

  _renderExportAction(environment){
    if (isElectron() && appRoleIsAdmin(this.props.parent.role)){
      return h.li({
        onClick: e => this.setState({exportOpen: environment, menuOpen: null})
      },[h.span("Export")])
    }
  }

  _renderImporterModal(environment){
    if (this.state.importOpen == environment){
      return h(ImportEnvContainer, {
        environment,
        app: this.props.parent,
        onClose: ()=> this.setState({importOpen: null})
      })
    }
  }

  _renderExporterModal(environment){
    if (this.state.exportOpen == environment){
      return h(ExportEnvContainer, {
        environment,
        app: this.props.parent,
        onClose: ()=> this.setState({exportOpen: null})
      })
    }
  }
}