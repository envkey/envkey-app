import React from 'react'
import {RadioGroup, Radio} from 'react-radio-group'
import moment from 'moment'
import AppImporter from './app_importer'
import { SubscriptionWallContainer } from 'containers'

export default class AppForm extends React.Component {

  constructor(props) {
    super(props)
    this.state = { importOption: "noImport" }
  }

  componentDidMount(){
    if(this.refs.name)this.refs.name.focus()
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit({
      willImport: this.state.importOption == "import",
      toImport: this._willImport() ? this.refs.appImporter.toImport() : undefined,
      params: {name: this.refs.name.value}
    })
  }

  _onImportOptionChange(val){
    this.setState({importOption: val})
  }

  _willImport(){
    return this.props.renderImporter && this.state.importOption == "import"
  }

  _showSubscriptionWall(){
    return this.props.numApps && this.props.currentOrg && this.props.numApps >= this.props.currentOrg.maxApps
  }

  render(){
    if (this._showSubscriptionWall()){
      return <SubscriptionWallContainer type="app"
                                        max={this.props.currentOrg.maxApps} />
    }

    return (
      <form ref="form"
            className="object-form new-form app-form"
            onSubmit={this._onSubmit.bind(this)}>

        <fieldset>
          <input className="app-name"
                 ref="name"
                 placeholder="App Name"
                 required />
        </fieldset>

        {this._renderImportOpts()}

        {this._renderImporter()}

        <fieldset>{this._renderSubmit()}</fieldset>
      </form>
    )
  }

  _renderImportOpts(){
    return <fieldset className="radio-opts import-opts">
      <RadioGroup selectedValue={this.state.importOption} onChange={::this._onImportOptionChange}>
        <label className={this.state.importOption == "noImport" ? "selected" : ""}>
          <Radio value="noImport" /> <strong>Start from scratch</strong>
        </label>
        <label className={this.state.importOption == "import" ? "selected" : ""}>
          <Radio value="import" /><strong>Import config</strong>
        </label>
      </RadioGroup>
    </fieldset>
  }

  _renderImporter(){
    if(this._willImport()){
      return <AppImporter ref="appImporter"
                          environments={this.props.environments}
                          embeddedInAppForm={true} />
    }
  }

  _renderSubmit(){
    if(this.props.isSubmitting){
      return <button disabled={true}> Creating App... </button>
    } else {
      return <button> {!this.props.renderImporter && this.state.importOption == "import" ? 'Next' : 'Create App'} </button>
    }
  }
}