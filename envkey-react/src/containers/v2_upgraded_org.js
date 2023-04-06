import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import { Link } from 'react-router'
import R from 'ramda'
import { getCurrentUser } from 'selectors'
import { clearedV2UpgradeOverlay } from "actions"
import SmallLoader from 'components/shared/small_loader'
import {OnboardOverlay} from 'components/onboard'
import {openLinkExternal} from 'lib/ui'

class UpgradedOrg extends React.Component {

  constructor(props){
    super(props)
  }

  render(){
    return <OnboardOverlay>
      <div className="v2-upgraded-org">
        <h1>V2 Upgrade</h1>

        <p><em>This organization and your user account have been upgraded to v2.</em></p>

        {
          this.props.currentUser.role == "org_owner" ?
           <p>Other users in your org will need to open EnvKey v1, download and run EnvKey v2, then initiate a quick account upgrade to finish moving their accounts to v2.</p> :
           ""
        }
{/*
        <p>Please reach out to <strong>support@envkey.com</strong> with any issues, questions, or concerns.</p>*/}


        <p>You can click below to go back to the v1 org, but <strong>changes won't be reflected in the v2 org.</strong></p>

        <fieldset><button className="" onClick={()=>{
              this.props.clearedV2UpgradeOverlay()
           }} >Go Back To V1 Org</button></fieldset>

           <br/> <br/> <br/>

        <Link className="back-link" to="/home">
          <span className="img">←</span>
          <span>Back To Home</span>
        </Link>
      </div>
    </OnboardOverlay>
  }
}

const mapStateToProps = state => ({
    currentUser: getCurrentUser(state)
  }),
  mapDispatchToProps = dispatch => ({
    clearedV2UpgradeOverlay: ()=> dispatch(clearedV2UpgradeOverlay())
  })

export default connect(mapStateToProps, mapDispatchToProps)(UpgradedOrg)