import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import EnvHeader from './env_header'
import EnvGrid from './env_grid'
import {AddAssoc} from 'components/assoc_manager'
import DecryptForm from 'components/shared/decrypt_form'
import DecryptLoader from 'components/shared/decrypt_loader'
import {AwaitingAccessContainer} from 'containers'

export default class EnvManager extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      addVar: false,
      addService: false,
      hideValues: true,
      filter: "",
      emptyOnInit: false,
    }
  }

  componentDidMount() {
    if (this.props.envsAreDecrypted &&
        !this.state.emptyOnInit &&
        this._isEmpty(this.props)){
      this.setState({addVar: true, emptyOnInit: true})
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.envsAreDecrypted &&
        !this.state.emptyOnInit &&
        this._isEmpty(nextProps)){
      this.setState({addVar: true, emptyOnInit: true})
    } else if (nextProps.parent.id != this.props.parent.id) {
      const isEmpty = this._isEmpty(nextProps)
      this.setState({addVar: isEmpty, emptyOnInit: isEmpty})
    }
  }

  _isEmpty(arg=null){
    const props = arg || this.props
    return props.entries.length + R.keys(props.entriesByServiceId) == 0
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
                      (this.state.addService ? " add-service" : "") +
                      (this.props.isUpdatingEnv ? " updating-env" : "") +
                      (this._isEmpty() ? " empty" : "")

    return h.div({className}, this._renderContents())
  }

  _renderContents(){
    if (!this.props.envAccessGranted){
      return [h(AwaitingAccessContainer)]
    } else if(this.props.envsAreDecrypted || this.props.isDecrypting){
      return [
        this._renderHeader(),
        this._renderBody(),
        h(DecryptLoader, this.props)
      ]
    }  else {
      return [h(DecryptForm, {onSubmit: this.props.decrypt})]
    }
  }

  _renderBody(){
    if (this.state.addService){
      return this._renderAddService()
    } else {
      return this._renderGrid()
    }
  }

  _renderHeader(){
    return h(EnvHeader, {
      ...this.props,
      ...R.pick(["addVar", "addService", "hideValues", "emptyOnInit"], this.state),
      isEmpty: this._isEmpty(),
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

  _renderGrid(){
    return h(EnvGrid, {
      ...this.props,
      ...R.pick(["hideValues", "filter", "addVar"], this.state)
    })
  }

}