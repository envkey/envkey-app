import React from 'react'
import R from 'ramda'
import SmallLoader from 'components/shared/small_loader'
import { SubscriptionWallContainer } from 'containers'

export default class ServerForm extends React.Component {

  componentDidMount(){
    if(this.refs.name)this.refs.name.focus()
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit({name: this.refs.name.value})
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

        <fieldset>{this._renderSubmit()}</fieldset>
      </form>
    )
  }

  _renderSubmit(){
    if(this.props.isSubmitting){
      return <SmallLoader />
    } else {
      return <button> <span>Add Server</span> </button>
    }
  }
}