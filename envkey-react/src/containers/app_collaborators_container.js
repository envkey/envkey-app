import React from 'react'
import { connect } from 'react-redux'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import moment from 'moment'
import { getColumnsFlattened } from "envkey-client-core/dist/lib/assoc/helpers"
import { getIsOnboarding, getDecryptedAll, getInvitingUser, getGeneratedInviteLink, getIsDemo } from 'selectors'
import { closeGeneratedInviteLink } from 'actions'
import { AssocManagerContainerFactory } from 'containers'
import {Onboardable} from 'components/onboard'
import {AppCollaboratorsSlider} from 'components/onboard'
import AssocManager from 'components/assoc_manager'
import {InviteUserOverlay} from 'components/invites'

const
  justInvitedFirstUser = (users)=>{
    if(users.length != 2)return false
    const invitedUser = R.sortBy(R.path(["relation", "createdAt"]), users)[1],
          date = moment(invitedUser.relation.createdAt),
          diffMinutes = moment().diff(date, "minutes")

    return diffMinutes < 5
  },

  startedOnboardingFn = (props, state)=> {
    const users = getColumnsFlattened(props.columnsConfig.columns),
          candidates = R.flatten(props.columnsConfig.columns.map(R.prop('candidates')))
    return candidates.length == 0 &&
           (users.length == 1 || justInvitedFirstUser(users)) &&
           !state.finishedOnboarding
  },

  finishedOnboardingFn = (props, state)=> {
    const users = getColumnsFlattened(props.columnsConfig.columns),
          res =  state.startedOnboarding &&
                 !state.finishedOnboarding &&
                 users.length > 1 &&
                 !justInvitedFirstUser(users)

    return res
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
    const container = h(OnboardableAssocManagerContainer, this.props)
    if (this.props.invitingUser || this.props.generatedInviteLink){
      return h.div([
        h(InviteUserOverlay, this.props),
        container
      ])
    } else {
      return container
    }
  }
}

const
  mapStateToProps = (state, ownProps) => ({
    isOnboarding: getIsOnboarding(state),
    envsAreDecrypted: getDecryptedAll(state),
    invitingUser: getInvitingUser(ownProps.app.id, state),
    generatedInviteLink: getGeneratedInviteLink(ownProps.app.id, state),
    isDemo: getIsDemo(state)
  }),

  mapDispatchToProps = (dispatch, ownProps) => ({
    closeInvite: ()=> dispatch(closeGeneratedInviteLink({parentId: ownProps.app.id}))
  })

export default connect(mapStateToProps, mapDispatchToProps)(AppCollaborators)

