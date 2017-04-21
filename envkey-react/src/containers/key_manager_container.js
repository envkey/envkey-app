import React from 'react'
import { connect } from 'react-redux'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import {Link} from "react-router"
import {
  getIsOnboarding,
  getCurrentAppUserForApp,
  getDecryptedAll,
  getServersForApp,
  getApps
} from 'selectors'
import {
  DevKeyManagerContainer,
  AssocManagerContainerFactory
} from 'containers'
import {Onboardable} from 'components/onboard'
import {
  AdminAppKeysSlider,
  ProdAccessAppKeysSlider,
  DevAccessAppKeysSlider
} from 'components/onboard'
import {appRoleHasProdAccess, appRoleIsAdmin} from 'lib/roles'

const canGenerateServerKeys = (props)=> R.any(R.path(["permissions", "generateKey"]), props.servers)

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
    if (canGenerateServerKeys(this.props)){
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
}

const

  mapStateToProps = (state, ownProps) => ({
    isOnboarding: getIsOnboarding(state),
    currentAppUser: getCurrentAppUserForApp(ownProps.app.id, state),
    envsAreDecrypted: getDecryptedAll(state),
    servers: getServersForApp(ownProps.app.id, state)
  }),

  startedOnboardingFn = (props, state)=> {
    return !(props.currentAppUser.role == "org_owner" && getApps(state).length > 1) &&
           !props.currentAppUser.keyGeneratedAt &&
           !state.finishedOnboarding
  },

  finishedOnboardingFn = (props, state)=> state.startedOnboarding &&
                                          !state.finishedOnboarding &&
                                          props.currentAppUser.keyGeneratedAt,

  selectedIndexFn = (props, state)=> (props.currentAppUser.keyGeneratedAt || state.finishedOnboarding) ? 1 : 0,

  OnboardSlider = (props)=> {
    if (appRoleIsAdmin(props.app.role)){
      return AdminAppKeysSlider(props)
    } else if (appRoleHasProdAccess(props.app.role)){
      return ProdAccessAppKeysSlider(props)
    } else {
      return DevAccessAppKeysSlider(props)
    }
  },

  OnboardableKeyManager = Onboardable(
    KeyManager,
    OnboardSlider,
    {startedOnboardingFn, finishedOnboardingFn, selectedIndexFn}
  )

export default connect(mapStateToProps)(OnboardableKeyManager)

