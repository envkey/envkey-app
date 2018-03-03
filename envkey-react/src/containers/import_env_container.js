import React from 'react'
import { connect } from 'react-redux'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import {secureRandomAlphanumeric} from 'lib/crypto'
import { parseMultiFormat } from 'lib/parse'
import { importerPlaceholder } from 'lib/env/imports'
import { importSingleEnvironment } from 'actions'
import {
  getApp,
  getIsImportingEnvironment,
  getImportErrors
} from 'selectors'

const initialState = {
  val: "",
  valid: false,
  parsed: null
}

class ImportEnv extends React.Component {

  constructor(props) {
    super(props)
    this.state = initialState
  }

  componentWillReceiveProps(nextProps){
    if (this.props.isSubmitting && !nextProps.isSubmitting){
      if (!this.props.importError && nextProps.importError){
        this.setState(initialState)
      } else {
        this.props.onClose()
      }
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit(this.state.parsed)
  }

  _onChange(e){
    const txt = e.target.value
    let val, valid, parsed

    if(txt){
      parsed = parseMultiFormat(txt.trim())
      valid = parsed != null
    } else {
      parsed = null
      valid = false
    }

    this.setState({val, valid, parsed})
  }

  render(){
    return h.div(".import-env", [
      h.div(".bg", {onClick: this.props.onClose}),
      h.form([
        this._renderClose(),
        <h3>Import To <em>{this.props.environment}</em></h3>,
        h.textarea({
          disabled: this.props.isSubmitting,
          value: this.val,
          placeholder: importerPlaceholder(this.props.environment),
          onChange: ::this._onChange
        }),

        this._renderSubmit()
      ])
    ])
  }

  _renderSubmit(){
    if(this.props.isSubmitting){
      return h.div(".actions", [
        h.button({disabled: true}, ["Importing..."]),
      ])
    } else {
      return h.div(".actions", [
        h.button({
          onClick: ::this._onSubmit,
          disabled: !this.state.valid || !this.state.parsed
        }, 'Import')
      ])
    }
  }

  _renderClose(){
    return h.span(".close", {onClick: this.props.onClose}, "⟵")
  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    isSubmitting: getIsImportingEnvironment(ownProps.app.id, ownProps.environment, state),
    importError: getImportErrors(ownProps.app.id, state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: parsed => dispatch(importSingleEnvironment({
      parsed,
      environment: ownProps.environment,
      parentType: "app",
      parentId: ownProps.app.id
    }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportEnv)