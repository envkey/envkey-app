import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import R from 'ramda'
import { getCurrentUser } from 'selectors'
import SmallLoader from 'components/shared/small_loader'
import {OnboardOverlay} from 'components/onboard'
import {openLinkExternal} from 'lib/ui'

class UpgradePrompt extends React.Component {

  constructor(props){
    super(props)
  }

  render(){
    return <div></div>
  }
}


const
  mapStateToProps = state => ({

  }),

  mapDispatchToProps = dispatch => ({

  })

export default connect(mapStateToProps, mapDispatchToProps)(UpgradePrompt)