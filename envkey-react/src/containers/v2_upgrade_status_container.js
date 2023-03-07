import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import R from 'ramda'
import {
  startV2Upgrade,
  acceptV2UpgradeInvite,
  cancelV2Upgrade
} from 'actions'
import {
  getV2CoreProcAlive,
  getV2CoreProcIsLoadingUpgrade,
  getV2CoreProcLoadedUpgrade,
  getUpgradeToken,
  getEncryptedV2InviteToken,
  getIsAcceptingV2UpgradeInvite,
  getDidAcceptV2UpgradeInvite,
  getUpgradeV2Error,
  getAcceptV2UpgradeInviteError
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
      this.props.acceptV2UpgradeInvite()
    }
  }

  render(){

    if (this.props.upgradeV2Error || this.props.acceptV2UpgradeInviteError){
      return <OnboardOverlay>
        <div className="v2-upgrade-status">
          <h1>V2 Upgrade</h1>

          <p>There was an error finishing your upgrade. Please contact <strong>support@envkey.com</strong> for help.</p>

          { (this.props.upgradeV2Error || this.props.acceptV2UpgradeInviteError).message ?
          <p>Error message: {(this.props.upgradeV2Error || this.props.acceptV2UpgradeInviteError).message}</p> :
          "" }

          <fieldset><button className="cancel" onClick={()=>{
              if (this.props.upgradeV2Error){
                this.props.cancelV2Upgrade()
              } else if (this.props.acceptV2UpgradeInviteError) {
                window.location.reload()
              }
           }} >Go Back</button></fieldset>
        </div>
       </OnboardOverlay>
    }

    return <OnboardOverlay>
      <div className="v2-upgrade-status">
        <h1>V2 Upgrade</h1>

        {
          this.props.v2CoreProcAlive ?
             ""
            :
              this.props.upgradeToken && this.props.encryptedV2InviteToken ?
                <p>Your EnvKey organization has been upgraded to v2. To finish upgrading your account, please leave EnvKey v1 running, then download EnvKey v2 for your platform from <a href="https://envkey.com" onClick={openLinkExternal}>envkey.com</a> and run it. Your upgrade will then continue automatically.</p> :
                <p>You're ready to upgrade! Please leave EnvKey v1 running, then download EnvKey v2 for your platform from <a href="https://envkey.com" onClick={openLinkExternal}>envkey.com</a> and run it. Your upgrade will then continue automatically.</p>
        }

        {
          this.props.v2CoreProcAlive || this.props.v2CoreProcIsLoadingUpgrade || this.props.v2CoreProcLoadedUpgrade ?
            "" :
            [<p>Waiting for EnvKey v2...</p>, <fieldset className="loader"><SmallLoader /></fieldset>]
        }

        {
          this.props.v2CoreProcIsLoadingUpgrade  ? [<p>EnvKey v2 is loading your upgrade.</p>, <fieldset className="loader"><SmallLoader /></fieldset>] : ""
        }

        {
          this.props.v2CoreProcLoadedUpgrade ? [<p>Upgrade loaded. Please leave EnvKey v1 running, then go to EnvKey v2 to finish your upgrade.</p>] : ""
        }


        {
          (this.props.upgradeToken && this.props.encryptedV2InviteToken) ||
          this.props.v2CoreProcIsLoadingUpgrade ||
          this.props.v2CoreProcLoadedUpgrade
            ? "" :
              <fieldset><button className="cancel" onClick={()=>{
                 this.props.cancelV2Upgrade()
              }} >Cancel Upgrade</button></fieldset>
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
    encryptedV2InviteToken: getEncryptedV2InviteToken(state),
    isAcceptingV2UpgradeInvite: getIsAcceptingV2UpgradeInvite(state),
    didAcceptV2UpgradeInvite: getDidAcceptV2UpgradeInvite(state),
    upgradeV2Error: getUpgradeV2Error(state),
    acceptV2UpgradeInviteError: getAcceptV2UpgradeInviteError(state)
  }),

  mapDispatchToProps = dispatch => ({
    acceptV2UpgradeInvite: ()=> dispatch(acceptV2UpgradeInvite()),
    cancelV2Upgrade: ()=> dispatch(cancelV2Upgrade())
  })

export default connect(mapStateToProps, mapDispatchToProps)(UpgradeOrgStatus)