import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import R from 'ramda'
import { startV2Upgrade } from 'actions'
import { getIsStartingV2Upgrade, getUpgradeV2Error } from 'selectors'
import SmallLoader from 'components/shared/small_loader'

class UpgradeOrg extends React.Component {

  constructor(props){
    super(props)
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit()
  }

  render(){
    return <form className="export-org object-form">
      <fieldset>
        <label>Upgrade Org To EnvKey V2</label>
      </fieldset>
      {this._renderSubmit()}
    </form>
  }

  _renderSubmit(){
    if (this.props.isStartingV2Upgrade){
      return <SmallLoader />
    } else if (this.props.upgradeV2Error){
      return <p class="error">
        <strong>There was a problem upgrading:</strong>
        {this.props.upgradeV2Error.message}
        {this.props.upgradeV2Error.stack}
      </p>
    }
    return <fieldset>
      <button onClick={::this._onSubmit}>Upgrade Org</button>
    </fieldset>
  }
}

const
  mapStateToProps = state => ({
    isStartingV2Upgrade: getIsStartingV2Upgrade(state),
    upgradeV2Error: getUpgradeV2Error(state),
  }),

  mapDispatchToProps = dispatch => ({
    onSubmit: params => dispatch(startV2Upgrade())
  })

export default connect(mapStateToProps, mapDispatchToProps)(UpgradeOrg)