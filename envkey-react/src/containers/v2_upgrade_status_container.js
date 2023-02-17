import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import R from 'ramda'
import {
  startV2Upgrade,
  waitForV2CoreProcAlive,
  acceptV2UpgradeInvite
} from 'actions'
import {
  getV2CoreProcAlive,
  getV2CoreProcIsLoadingUpgrade,
  getV2CoreProcLoadedUpgrade,
  getUpgradeToken,
  getEncryptedV2InviteToken
} from 'selectors'
import SmallLoader from 'components/shared/small_loader'
import {OnboardOverlay} from 'components/onboard'
import {openLinkExternal} from 'lib/ui'

class UpgradeOrgStatus extends React.Component {

  constructor(props){
    super(props)
  }

  componentDidMount(){
    if (this.props.upgradeToken && this.props.encryptedV2InviteToken){
      this.props.startCheckingAlive()
    }
  }

  render(){
    return <OnboardOverlay>
      <div>
        <h1>V2 Upgrade</h1>

        {
          this.props.v2CoreProcAlive ?
             this.props.upgradeToken && this.props.encryptedV2InviteToken ?
               <p>EnvKey V2 is now running. Click below to finish the upgrade.</p>  :
                ""
            :
              this.props.upgradeToken && this.props.encryptedV2InviteToken ?
                <p>Your EnvKey organization has been upgraded to V2. To finish upgrading your account, please download EnvKey V2 for your platform from <a href="https://envkey.com" onClick={openLinkExternal}>envkey.com</a> and then run it (be sure you're running version 2.3.0 or higher). Your upgrade will then continue automatically.</p> :
                <p>You're ready to upgrade! Please download EnvKey V2 for your platform from <a href="https://envkey.com" onClick={openLinkExternal}>envkey.com</a> and then run it (be sure you're running version 2.3.0 or higher). Your upgrade will then continue automatically.</p>
        }

        {
          this.props.v2CoreProcAlive ?
            "" :
            <p>EnvKey V2 is not yet running...</p>
        }

        {
          this.props.v2CoreProcIsLoadingUpgrade ? [<p>EnvKey V2 is loading your upgrade.</p>, <SmallLoader />] : ""
        }

        {
          this.props.v2CoreProcLoadedUpgrade ? [<p>Please go to EnvKey V2 to finish your upgrade.</p>] : ""
        }

        {
          this.props.upgradeToken && this.props.encryptedV2InviteToken ?
            <div>
                <button disabled={!this.props.v2CoreProcAlive} onClick={()=>{
                  this.props.acceptV2UpgradeInvite()
                }} >Finish Upgrade</button>
            </div> :
              ""
        }


      </div>
    </OnboardOverlay>
  }
}


const
  mapStateToProps = state => ({
    v2CoreProcAlive: getV2CoreProcAlive(state),
    v2CoreProcIsLoadingUpgrade: getV2CoreProcIsLoadingUpgrade(state),
    v2CoreProcLoadedUpgrade: getV2CoreProcLoadedUpgrade(state),
    upgradeToken: getUpgradeToken(state),
    encryptedV2InviteToken: getEncryptedV2InviteToken(state)
  }),

  mapDispatchToProps = dispatch => ({
    startCheckingAlive: ()=> dispatch(waitForV2CoreProcAlive()),
    acceptV2UpgradeInvite: ()=> dispatch(acceptV2UpgradeInvite())
  })

export default connect(mapStateToProps, mapDispatchToProps)(UpgradeOrgStatus)