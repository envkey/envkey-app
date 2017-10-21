import React from 'react'
import R from 'ramda'
import SmallLoader from 'components/shared/small_loader'
import { SubscriptionWallContainer } from 'containers'

export default class ServerForm extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      selectedSubEnv: null
    }
  }

  componentDidMount(){
    if(this.refs.name)this.refs.name.focus()
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit({name: this.refs.name.value, subEnvId: this.state.selectedSubEnv})
  }

  _onSelectSubEnv(e){
    this.setState({selectedSubEnv: e.target.value})
  }

  _numKeys(){
    return R.flatten(R.values(this.props.groups)).length
  }

  _showSubscriptionWall(){
    return this.props.currentOrg && this._numKeys() >= this.props.currentOrg.maxKeysPerEnv
  }

  render(){
    if (this._showSubscriptionWall()){
      return <SubscriptionWallContainer subject={`The ${this.props.role} environment`}
                                        type="key"
                                        max={this.props.currentOrg.maxKeysPerEnv} />
    }

    return (
      <form className="object-form add-server"
            onSubmit={this._onSubmit.bind(this)}>

        <fieldset>
          <input type="text"
                 disabled={this.props.isSubmitting}
                 className="server-name"
                 ref="name"
                 placeholder="Server Name"
                 required />
        </fieldset>

        {this._renderSubEnvSelect()}

        <fieldset>{this._renderSubmit()}</fieldset>
      </form>
    )
  }

  _renderSubEnvSelect(){
    if (this.props.subEnvOpts.length){
      return <fieldset className="full-select">
        <select onChange={::this._onSelectSubEnv}>
          {this._renderSubEnvOptions()}
        </select>
      </fieldset>
    }
  }

  _renderSubEnvOptions(){
    return [<option key={0} value="">No sub-environment</option>].concat(this.props.subEnvOpts.map(({id, name}, i)=>{
      return <option key={i+1} value={id} >{name}</option>
    }))
  }

  _renderSubmit(){
    if(this.props.isSubmitting){
      return <SmallLoader />
    } else {
      return <button> <span>Add Server</span> </button>
    }
  }
}