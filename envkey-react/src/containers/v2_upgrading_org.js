import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import { Link } from 'react-router'
import R from 'ramda'
import { getCurrentUser } from 'selectors'
import SmallLoader from 'components/shared/small_loader'
import {OnboardOverlay} from 'components/onboard'
import {openLinkExternal} from 'lib/ui'

class UpgradingOrg extends React.Component {

  constructor(props){
    super(props)
  }

  render(){
    return <OnboardOverlay>
      <div className="v2-upgraded-org">
        <h1>V2 Upgrade</h1>

        <p><em>This organization is being upgraded to EnvKey v2.</em></p>

        <p>Until the upgrade finishes, your org is in <strong>read-only mode.</strong> ENVKEYs will continue to work, but environment updates and other actions aren't allowed.</p>

        <p>Once the upgrade finishes, <strong>come back here</strong> to upgrade your user account to v2 with a couple clicks.</p>

        <p><strong>One caveat:</strong> if your org switches to SSO, you'll get a separate invite to join EnvKey via your org's SSO system rather than upgrading from here. If that's the case, no further action is needed.</p>

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
  })

export default connect(mapStateToProps, mapDispatchToProps)(UpgradingOrg)