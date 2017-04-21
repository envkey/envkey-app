import React from 'react'
import { connect } from 'react-redux'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import { getColumnsFlattened } from "lib/assoc/helpers"
import { getIsOnboarding, getDecryptedAll } from 'selectors'
import { AssocManagerContainerFactory } from 'containers'
import {Onboardable} from 'components/onboard'
import {AppCollaboratorsSlider} from 'components/onboard'
import AssocManager from 'components/assoc_manager'

const
  startedOnboardingFn = (props, state)=> {
    const users = getColumnsFlattened(props.columnsConfig.columns),
          candidates = R.flatten(props.columnsConfig.columns.map(R.prop('candidates')))
    return candidates.length == 0 &&
           users.length == 1 &&
           !state.finishedOnboarding
  },

  finishedOnboardingFn = (props, state)=> {
    const users = getColumnsFlattened(props.columnsConfig.columns)
    return state.startedOnboarding &&
           !state.finishedOnboarding &&
           users.length > 1
  },

  selectedIndexFn = (props, state)=> {
    const users = getColumnsFlattened(props.columnsConfig.columns)
    return (users.length == 1 && !state.finishedOnboarding) ? 0 : 1
  },

  OnboardableAssocManager = Onboardable(AssocManager, AppCollaboratorsSlider, {startedOnboardingFn, finishedOnboardingFn, selectedIndexFn}),

  OnboardableAssocManagerContainer = AssocManagerContainerFactory({
    AssocManagerClass: OnboardableAssocManager,
    parentType: "app",
    assocType: "user",
    isManyToMany: true
  })

class AppCollaborators extends React.Component {

  render(){
    return h(OnboardableAssocManagerContainer, this.props)
  }

}

const mapStateToProps = (state, ownProps) => ({
  isOnboarding: getIsOnboarding(state),
  envsAreDecrypted: getDecryptedAll(state)
})

export default connect(mapStateToProps)(AppCollaborators)

