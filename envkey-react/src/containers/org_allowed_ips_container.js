import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import {
  getCurrentOrg,
  getIsUpdatingNetworkSettings
} from "selectors"
import {
  updateNetworkSettings
} from "actions"
import SmallLoader from 'components/shared/small_loader'
import {isValidIPString} from 'envkey-client-core/dist/lib/utils/string'

const
  ALLOWED_IP_FIELDS = [
    "allowedIpsApi",
    "allowedIpsLocal",
    "allowedIpsTest",
    "allowsIpsStaging",
    "allowedIpsProduction"
  ],
  getInitialState = R.pipe(
    R.prop('allowedIps'),
    R.pick(ALLOWED_IP_FIELDS)
  )

class OrgAllowedIps extends React.Component {

  constructor(props){
    super(props)
    this.state = getInitialState(props)
  }

  componentWillReceiveProps(nextProps) {
    if (!R.equals(getInitialState(nextProps), getInitialState(this.props))){
      // for handling socket updates
      this.setState(getInitialState(nextProps))
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.updateAllowedIpSettings(this.props.id, this.state)
  }

  _isValid(field){
    const val = this.state[field]
    return val ? isValidIPString(val) : true
  }

  _allValid(){
    return  !R.equals(getInitialState(this.props), this.state) &&
            R.all(field => this._isValid(field), ALLOWED_IP_FIELDS)
  }

  render(){
    return <form className="settings object-form allowed-networks"
                 onSubmit={::this._onSubmit} >

      <fieldset>
        <label>EnvKey App Allowed Networks</label>

        <p className="msg">Allowed networks for requests from the EnvKey App.</p>
        <textarea type="text"
                  className={this._isValid("allowedIpsApi") ? '' : 'invalid'}
                  placeholder="*"
                  value={this.state.allowedIpsApi}
                  onChange={e => this.setState({allowedIpsApi: e.target.value})} />

        {this._renderInvalidMsg("allowedIpsApi")}

        {this._renderHelpMsg()}
      </fieldset>

      <fieldset>
        <label>Local Development Allowed Networks</label>

        <p className="msg">Default allowed networks for Local Development ENVKEYs. These can be extended or overriden on an app-specific basis.</p>
        <textarea type="text"
                  className={this._isValid("allowedIpsLocal") ? '' : 'invalid'}
                  placeholder="*"
                  value={this.state.allowedIpsLocal}
                  onChange={e => this.setState({allowedIpsLocal: e.target.value})} />

        {this._renderInvalidMsg("allowedIpsLocal")}

        {this._renderHelpMsg()}
      </fieldset>

      <fieldset>
        <label>Test Server Allowed Networks</label>

        <p className="msg">Default allowed networks for Test Server ENVKEYs. These can be extended or overriden on an app-specific basis.</p>
        <textarea type="text"
                  className={this._isValid("allowedIpsTest") ? '' : 'invalid'}
                  placeholder="*"
                  value={this.state.allowedIpsTest}
                  onChange={e => this.setState({allowedIpsTest: e.target.value})} />

        {this._renderInvalidMsg("allowedIpsTest")}

        {this._renderHelpMsg()}
      </fieldset>

      <fieldset>
        <label>Staging Server Allowed Networks</label>

        <p className="msg">Default allowed networks for Staging Server ENVKEYs. These can be extended or overriden on an app-specific basis.</p>
        <textarea type="text"
                  className={this._isValid("allowedIpsStaging") ? '' : 'invalid'}
                  placeholder="*"
                  value={this.state.allowedIpsStaging}
                  onChange={e => this.setState({allowedIpsStaging: e.target.value})} />

        {this._renderInvalidMsg("allowedIpsStaging")}

        {this._renderHelpMsg()}
      </fieldset>

      <fieldset>
        <label>Production Server Allowed Networks</label>

        <p className="msg">Default allowed networks for Production Server ENVKEYs. These can be extended or overriden on an app-specific basis.</p>
        <textarea type="text"
                  className={this._isValid("allowedIpsProduction") ? '' : 'invalid'}
                  placeholder="*"
                  value={this.state.allowedIpsProduction}
                  onChange={e => this.setState({allowedIpsProduction: e.target.value})} />

        {this._renderInvalidMsg("allowedIpsProduction")}

        {this._renderHelpMsg()}
      </fieldset>

      <fieldset>
        {this._renderSubmit()}
      </fieldset>

    </form>
  }

  _renderInvalidMsg(field){
    if (!this._isValid(field)){
      return <p className="invalid-msg">
        Not a valid list of IPs and/or CIDR ranges.
      </p>
    }
  }

  _renderHelpMsg(){
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

const mapStateToProps = state => {
  const currentOrg = getCurrentOrg(state)

  return {
    id: currentOrg.id,
    allowedIps: currentOrg.allowedIps,
    isUpdating: getIsUpdatingNetworkSettings(currentOrg.id, state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateAllowedIpSettings: (targetId, params) => dispatch(updateNetworkSettings({
      objectType: "org",
      targetId,
      params
    }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrgAllowedIps)

