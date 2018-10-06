import React from 'react'
import {RadioGroup, Radio} from 'react-radio-group'
import moment from 'moment'
import EnvImporter from './env_importer'

const EnvParentFormFactory = ({parentType, parentTypeLabel})=> class extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      importOption: "noImport",
      importValid: false
    }
  }

  componentDidMount(){
    if(this.refs.name)this.refs.name.focus()
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit({
      willImport: this.state.importOption == "import",
      toImport: this._willImport() ? this.refs.envImporter.toImport() : undefined,
      params: {name: this.refs.name.value}
    })
  }

  _onImportOptionChange(val){
    this.setState({importOption: val})
  }

  _willImport(){
    return this.props.renderImporter && this.state.importOption == "import"
  }

  render(){
    return (
      <form ref="form"
            className="object-form new-form env-parent-form"
            onSubmit={this._onSubmit.bind(this)}>

        <fieldset>
          <input type="text"
                 className="env-parent-name"
                 disabled={this.props.isSubmitting}
                 ref="name"
                 placeholder={`${parentTypeLabel} Name`}
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
          <Radio disabled={this.props.isSubmitting} value="noImport" /> <strong>Start from scratch</strong>
        </label>
        <label className={this.state.importOption == "import" ? "selected" : ""}>
          <Radio disabled={this.props.isSubmitting} value="import" /><strong>Import config</strong>
        </label>
      </RadioGroup>
    </fieldset>
  }

  _renderImporter(){
    if(this._willImport()){
      return <EnvImporter ref="envImporter"
                          environments={this.props.environments}
                          embeddedInNewForm={true}
                          onChange={importValid => this.setState({importValid})}/>
    }
  }

  _renderSubmit(){
    if(this.props.isSubmitting){
      return <button disabled={true}> Creating {parentTypeLabel}... </button>
    } else {
      if (!this.props.renderImporter && this.state.importOption == "import"){
        return <button>Next</button>
      } else {
        const disabled = this.state.importOption == "import" && !this.state.importValid
        return <button disabled={disabled}>Create {parentTypeLabel}</button>
      }
    }
  }
}

export default EnvParentFormFactory