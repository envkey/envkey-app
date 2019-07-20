import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import SmallLoader from "components/shared/small_loader"
import { SubscriptionWallContainer } from 'containers'

export default class SubEnvForm extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      name: "",
      cloneExistingSubEnv: false,
      cloneSubEnvId: null
    }
  }

  componentDidMount() {
    if(this.refs.nameInput)this.refs.nameInput.focus()
  }

  _onAddSubEnv(e){
    e.preventDefault()
    this.props.addSubEnv({
      ...R.pick(["environment"], this.props),
      ...R.pick(["name", "cloneSubEnvId"], this.state)
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

  _clonableSubEnvs(){
    return R.toPairs(this.props.subEnvsByRole)
            .filter(([_, subEnvs])=> subEnvs.length > 0)
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
        placeholder: "Sub-environment name",
        value: this.state.name,
        onChange: e => this.setState({name: e.target.value})
      }),
      this._renderCloneToggle(),
      this._renderCloneSelect(),
      this._renderSubmit()
    ])
  }

  _renderCloneToggle(){
    if (this._clonableSubEnvs().length > 0){
      return <div
        className={'clone-toggle' + (this.state.cloneExistingSubEnv ? " selected" : "")}
        onClick={e => this.setState({
          cloneExistingSubEnv: !this.state.cloneExistingSubEnv,
          cloneSubEnvId: null
        })}
       >
        <input type="checkbox" checked={this.state.cloneExistingSubEnv} />
        <label>Clone existing sub-environment</label>
      </div>
    }
  }

  _renderCloneSelect(){
    if (this.state.cloneExistingSubEnv){
      return <div className="clone-select">
        <select
          value={this.state.cloneSubEnvId || "placeholder"}
          onChange={e => this.setState({cloneSubEnvId: e.target.value})  }>
          {
            [
              <option value="placeholder" disabled={true}>Select a sub-environment to clone</option>
            ].concat(
              this._clonableSubEnvs().map(([role, subEnvs], i)=> (
                <optgroup key={i} label={role.toUpperCase()}>
                 {subEnvs.map(({id, name}, j)=> <option key={j} value={id}>{name.toUpperCase()}</option>)}
               </optgroup>
              ))
            )
          }

        </select>
      </div>
    }

  }

  _renderSubmit(){
    return h.button(
      ".button",
      {
        disabled: !(this.state.name && (!this.state.cloneExistingSubEnv || this.state.cloneSubEnvId))
      },
      `Add ${this.props.environment} Sub-environment`
    )
  }
}