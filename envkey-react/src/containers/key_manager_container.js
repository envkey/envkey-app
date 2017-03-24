import React from 'react'
import { connect } from 'react-redux'
import h from "lib/ui/hyperscript_with_helpers"
import {Link} from "react-router"
import { getIsOnboarding, getCurrentAppUserForApp, getEnvsAreDecrypted } from 'selectors'
import {
  DevKeyManagerContainer,
  AssocManagerContainerFactory
} from 'containers'
import Onboardable from 'components/onboard/traits/onboardable'
import {AppKeysSlider} from 'components/onboard/onboard_slider'

class KeyManager extends React.Component {

  _classNames(){
    return []
  }

  render(){
    return h(".key-manager", {className: this._classNames().join(" ")}, this._renderContents())
  }

  _renderContents(){
    return [
      this._renderDevKey(),
      this._renderServerKeys()
    ]
  }

  _renderDevKey(){
    return h.section(".development-key-section", [
      h.div(".key-section-head", [
        h.h4(this.props.app.name),
        h.h2([h.strong("Development"), " Key"]),

        h.p([
          "Use this key to access your config’s development environment on your own machine. You shouldn't share it with anyone else."
        ])
      ]),

      h.div(".key-section-content", [
        h(DevKeyManagerContainer, this.props)
      ])
    ])
  }

  _renderServerKeys(){
    return h.section(".server-keys-section", [
      h.div(".key-section-head", [
        h.h4(this.props.app.name),
        h.h2([h.strong("Server"), " Keys"]),

        h.p("Use these keys to give servers access to your config. You can reuse a key if you have multiple servers that need the same environment.")

      ]),

      h.div(".key-section-content", [
        h(AssocManagerContainerFactory({parentType: "app", assocType: "server"}), this.props)
      ])
    ])
  }
}

const
  mapStateToProps = (state, ownProps) => ({
    isOnboarding: getIsOnboarding(state),
    currentAppUser: getCurrentAppUserForApp(ownProps.app.id, state),
    envsAreDecrypted: getEnvsAreDecrypted(state)
  }),

  startedOnboardingFn = (props, state)=> !props.currentAppUser.keyGeneratedAt && !state.finishedOnboarding,

  finishedOnboardingFn = (props, state)=> state.startedOnboarding &&
                                          !state.finishedOnboarding &&
                                          props.currentAppUser.keyGeneratedAt,

  selectedIndexFn = (props, state)=> (props.currentAppUser.keyGeneratedAt || state.finishedOnboarding) ? 1 : 0,

  OnboardableKeyManager = Onboardable(KeyManager, AppKeysSlider, {startedOnboardingFn, finishedOnboardingFn, selectedIndexFn})

export default connect(mapStateToProps)(OnboardableKeyManager)

