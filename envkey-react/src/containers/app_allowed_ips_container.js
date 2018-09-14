import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import {
  getCurrentOrg,
  getIsUpdatingNetworkSettings,
  getAllowedIpsMergeStrategies
} from "selectors"
import {
  updateNetworkSettings
} from "actions"
import SmallLoader from 'components/shared/small_loader'
import {isValidIPString} from 'lib/utils/string'

const
  ALLOWED_IP_LABELS = {
    allowedIpsLocal: [
      "Local Development Keys Allowed Networks",
      "Allowed networks for this app's Local Development ENVKEYs."
    ],
    allowedIpsTest: [
      "Test Server Keys Allowed Networks",
      "Allowed networks for this app's Test Server ENVKEYs."
    ],
    allowedIpsStaging: [
      "Staging Server Keys Allowed Networks",
      "Allowed networks for this app's Staging Server ENVKEYs."
    ],
    allowedIpsProduction: [
      "Production Server Keys Allowed Networks",
      "Allowed networks for this app's Production Server ENVKEYs."
    ],
  },
  ALLOWED_IP_FIELDS = R.keys(ALLOWED_IP_LABELS),

  ALLOWED_IP_MERGE_STRATEGY_FIELDS = ALLOWED_IP_FIELDS.map(s => s + "MergeStrategy"),

  MERGE_STRATEGY_LABELS = {
    inherit: "Inherit From Org Allowed Networks",
    extend: "Extend Org Allowed Networks",
    override: "Override Org Allowed Networks"
  },

  getInitialState = R.pipe(
    R.path(['app','allowedIps']),
    R.pick(ALLOWED_IP_FIELDS.concat(ALLOWED_IP_MERGE_STRATEGY_FIELDS))
  )

class AppAllowedIps extends React.Component {

  constructor(props){
    super(props)
    this.state = getInitialState(props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.app.id != this.props.app.id){
      this.setState(getInitialState(nextProps))
    } else if (!R.equals(getInitialState(nextProps), getInitialState(this.props))){
      // for handling socket updates
      this.setState(getInitialState(nextProps))
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.updateAllowedIpSettings(this.props.app.id, this.state)
  }

  _getOnMergeStrategyChange(field){
    return (e)=> {
      const strategyInt = parseInt(e.target.value),
            strategy = R.invertObj(this.props.allowedIpsMergeStrategies)[strategyInt],
            update = {[field + "MergeStrategy"]: strategyInt}

      if (strategy == "inherit" || (strategy == "extend" && !this._orgVal(field))){
        update[field] = null
      }

      this.setState(update)
    }
  }

  _orgVal(field){
    return this.props.currentOrg.allowedIps[field]
  }

  _isValid(field){
    const val = this.state[field]
    return val ? isValidIPString(val) : true
  }

  _allValid(){
    return !R.equals(getInitialState(this.props), this.state) &&
           R.all(field => this._isValid(field), ALLOWED_IP_FIELDS)
  }

  _mergeStrategyForField(field){
    const i = this.state[field + "MergeStrategy"]
    return R.invertObj(this.props.allowedIpsMergeStrategies)[i]
  }

  render(){
    return <form className="settings object-form allowed-networks"
                 onSubmit={::this._onSubmit} >

      {this._renderFieldsets()}

      <fieldset>
        {this._renderSubmit()}
      </fieldset>

    </form>
  }

  _renderFieldsets(){
    return R.toPairs(ALLOWED_IP_LABELS).map(([field, [label, msg]])=> {
      return this._renderFieldset(field, label, msg)
    })
  }

  _renderFieldset(field, label, msg){
    return <fieldset>
      <label>{label}</label>

      <p className="msg">{msg}</p>

      <select className="select-merge-strategy"
              onChange={this._getOnMergeStrategyChange(field)}
              value={this.state[field + "MergeStrategy"]}>
        {this._renderMergeStrategyOpts()}
      </select>

      {this._renderIPField(field)}
      {this._renderInvalidMsg(field)}
    </fieldset>
  }

  _renderIPField(field){
    const strategy = this._mergeStrategyForField(field)

    if (strategy == "inherit"){
      return <div>
        <textarea type="text"
                  disabled={true}
                  value={this.props.currentOrg.allowedIps[field] || "*"} />

      </div>
    } else if (strategy == "override"){
      return <div>
        <textarea className={this._isValid(field) ? '' : 'invalid'}
                       type="text"
                       placeholder="*"
                       value={this.state[field]}
                       onChange={e => this.setState({[field]: e.target.value})} />
        {this._renderHelp()}
      </div>
    } else if (strategy == "extend"){
      return <div className="ip-field-extends">
        <label className="small">Org Allowed Networks</label>
        <textarea className="org-field"
                  type="text"
                  disabled={true}
                  value={this.props.currentOrg.allowedIps[field] || "*"} />

        {this._renderAppExtendField(field)}
      </div>
    }
  }

  _renderAppExtendField(field){
    return  <div>
      <label className="small">App Allowed Networks</label>
      <textarea className={'app-field ' + (this._isValid(field) ? '' : 'invalid')}
                value={this.state[field]}
                onChange={e => this.setState({[field]: e.target.value})} />
      {this._renderHelp()}
    </div>
  }

  _renderMergeStrategyOpts(){
    return R.toPairs(this.props.allowedIpsMergeStrategies).map(([strategy, i])=>{
      return <option value={i}>{MERGE_STRATEGY_LABELS[strategy]}</option>
    })
  }

  _renderInvalidMsg(field){
    if (!this._isValid(field)){
      return <p className="invalid-msg">
        Not a valid list of IPs and/or CIDR ranges.
      </p>
    }
  }

  _renderHelp(){
    return <p className="msg small">Accepts valid IPV4/IPV6 IPs and CIDR ranges. Use commas, semicolons, or line breaks as delimiters. Example: `172.18.0.0/24, 192.12.24.123`</p>
  }

  _renderSubmit(){
    if (this.props.isUpdating){
      return <SmallLoader />
    } else {
      return <button disabled={!this._allValid()}> <span>Update Network Settings</span> </button>
    }
  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    currentOrg: getCurrentOrg(state),
    isUpdating: getIsUpdatingNetworkSettings(ownProps.app.id, state),
    allowedIpsMergeStrategies: getAllowedIpsMergeStrategies(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateAllowedIpSettings: (targetId, params) => dispatch(updateNetworkSettings({
      objectType: "app",
      targetId,
      params
    }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppAllowedIps)

