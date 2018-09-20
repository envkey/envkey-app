import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import R from 'ramda'
import { exportEnvironment } from 'actions'
import isElectron from 'is-electron'

class ExportEnv extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      format: "env"
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit({format: this.state.format})
    this.props.onClose()
  }

  _onChangeFormat(e){
    this.setState({format: e.target.value})
  }

  _environmentTitle(){
    return this.props.subEnv ? this.props.subEnv["@@__name__"] : this.props.environment
  }

  render(){
    return h.div(".env-modal.export-env", [
      h.div(".bg", {onClick: this.props.onClose}),
      h.form([
        this._renderClose(),
        <h3>Export <em>{this._environmentTitle()}</em></h3>,

        this._renderFormatSelect(),

        this._renderSubmit()
      ])
    ])
  }

  _renderFormatSelect(){
    return <fieldset>
      <label>Format</label>
      <select value={this.state.format} onChange={::this._onChangeFormat}>
        <option value="env">.env (KEY=VAL)</option>
        <option value="yaml">.yaml</option>
        <option value="json">.json</option>
      </select>
    </fieldset>
  }

  _renderSubmit(){
    if (isElectron()){
      return h.div(".actions", [
        h.button({
          onClick: ::this._onSubmit
        }, 'Export')
      ])
    } else {
      return h.p(".desktop-only", "Exports are only available in the EnvKey App.")
    }
  }

  _renderClose(){
    return h.span(".close", {onClick: this.props.onClose}, "⟵")
  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: params => {
      const subEnvId = R.path(["subEnv", "@@__id__"], ownProps),
            subEnvName = R.path(["subEnv", "@@__name__"], ownProps)
      dispatch(exportEnvironment({
        ...params,
        subEnvId,
        subEnvName,
        environment: ownProps.environment,
        parentType: "app",
        parentId: ownProps.app.id,
      }))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExportEnv)