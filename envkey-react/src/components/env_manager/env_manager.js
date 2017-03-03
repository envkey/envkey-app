import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import EnvHeader from './env_header'
import EnvGrid from './env_grid'
import EntryForm from './entry_form'
import {AddAssoc} from 'components/assoc_manager'

export default class EnvManager extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      addVar: false,
      addService: false,
      hideValues: true,
      filter: ""
    }
  }

  _onSubmitDecryptionPassword(e){
    e.preventDefault()
    this.props.decrypt(this.refs.password.value)
  }

  _onAddServices(...args){
    this.setState({addService: false})
    this.props.addServices(...args)
  }

  _onCreateService(...args){
    this.setState({addService: false})
    this.props.createService(...args)
  }

  render(){
    const className = "environments " +
                      [this.props.parentType, "parent"].join("-") +
                      (this.state.addVar ? " add-var" : "") +
                      (this.state.addService ? " add-service" : "")

    return h.div({className}, this._renderContents())
  }

  _renderContents(){
    if(this.props.envsAreDecrypted){
      return [
        this._renderHeader(),
        this._renderBody()
      ]
    } else if(this.props.isDecrypting){
      return [this._renderDecryptingLoader()]
    }  else {
      return [this._renderDecryptForm()]
    }
  }

  _renderBody(){
    if(this.state.addVar){
      return this._renderAddVar()
    } else if (this.state.addService){
      return this._renderAddService()
    } else {
      return this._renderGrid()
    }
  }

  _renderDecryptForm(){
    return h.form(".decypt-envs", {
      onSubmit: ::this._onSubmitDecryptionPassword
    }, [
      h.input(".password", {
        ref: "password",
        type: "password",
        defaultValue: "password"
      }),
      h.button("Decrypt")
    ])
  }

  _renderDecryptingLoader(){
    return h.h2("Decrypting...")
  }

  _renderHeader(){
    return h(EnvHeader, {
      ...this.props,
      ...R.pick(["addVar", "addService", "hideValues"], this.state),
      onFilter: s => this.setState({filter: s.trim().toLowerCase()}),
      onToggleHideValues: ()=> this.setState(state => ({hideValues: !state.hideValues})),
      onAddVar: ()=> this.setState(state => ({addVar: !state.addVar})),
      onAddService: ()=> this.setState(state => ({addService: !state.addService}))
    })
  }

  _renderAddService(){
    return h(AddAssoc, {
      ...this.props.addServiceConfig,
      addAssoc: ::this._onAddServices,
      createAssoc: ::this._onCreateService
    })
  }

  _renderAddVar(){
    return h(EntryForm, {
      isSubmitting: this.props.isCreatingEntry,
      environments: this.props.environments,
      onSubmit: this.props.createEntry
    })
  }

  _renderGrid(){
    return h(EnvGrid, {
      ...this.props,
      ...R.pick(["hideValues", "filter"], this.state)
    })
  }

}