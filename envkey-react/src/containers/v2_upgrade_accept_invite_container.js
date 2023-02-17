import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import R from 'ramda'
import { startV2Upgrade } from 'actions'
import { getV2CoreProcAlive, getV2CoreProcIsLoadingUpgrade, getV2CoreProcLoadedUpgrade } from 'selectors'
import SmallLoader from 'components/shared/small_loader'
import {OnboardOverlay} from 'components/onboard'
import {openLinkExternal} from 'lib/ui'

class UpgradeOrgAcceptInvite extends React.Component {

  constructor(props){
    super(props)
  }

  render(){
    return <OnboardOverlay>
      <div>
        <h1>V2 Upgrade</h1>

        <p></p>


      </div>
    </OnboardOverlay>
  }
}


const
  mapStateToProps = state => ({
    v2CoreProcAlive: getV2CoreProcAlive(state),
    v2CoreProcIsLoadingUpgrade: getV2CoreProcIsLoadingUpgrade(state),
    v2CoreProcLoadedUpgrade: getV2CoreProcLoadedUpgrade(state)
  }),

  mapDispatchToProps = dispatch => ({

  })

export default connect(mapStateToProps, mapDispatchToProps)(UpgradeOrgAcceptInvite)