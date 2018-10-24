import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import SmallLoader from "components/shared/small_loader"
import { SubscriptionWallContainer } from 'containers'

export default class SubEnvForm extends React.Component {

  componentDidMount() {
    if(this.refs.nameInput)this.refs.nameInput.focus()
  }

  _onAddSubEnv(e){
    e.preventDefault()
    this.props.addSubEnv({
      parentEnvironment: this.props.environment,
      name: this.refs.nameInput.value
    })
  }

  _numSubEnvs(){
    return R.pipe(
      R.pathOr({}, [this.props.environment, "@@__sub__"]),
      R.keys,
      R.length
    )(this.props.envsWithMeta)
  }

  _maxSubEnvs(){
    return this.props.currentOrg.maxKeysPerEnv - 1
  }

  _showSubscriptionWall(){
    return this.props.currentOrg && this._numSubEnvs() >= this._maxSubEnvs()
  }

  render(){
    if (this._showSubscriptionWall()){
      return h(SubscriptionWallContainer, {
        subject: `The ${this.props.environment} environment`,
        type: "sub-environment",
        max: this._maxSubEnvs()
      })
    }

    return h.form(".sub-env-form", {onSubmit: ::this._onAddSubEnv}, [
      h.input({
        ref: "nameInput",
        type: "text",
        placeholder: "Sub-environment name"
      }),
      this._renderSubmit()
    ])
  }

  _renderSubmit(){
    return h.button(".button", `Add ${this.props.environment} Sub-environment`)
  }
}