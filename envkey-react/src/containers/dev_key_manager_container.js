import React from 'react'
import { connect } from 'react-redux'
import {
  generateKey,
  decrypt
} from 'actions'
import {
  getIsGeneratingAssocKey,
  getIsDecrypting,
  getEnvsAreDecrypted,
  getCurrentUser,
  getCurrentAppUserForApp,
  getEnvAccessGranted
} from 'selectors'
import {DevKeyManager} from 'components/assoc_manager'

  const mapStateToProps = (state, ownProps) => {
    const {id: appId} = ownProps.app
    return {
      joinType: "appUser",
      currentUser: getCurrentUser(state),
      assoc: getCurrentAppUserForApp(appId, state),
      isGeneratingAssocKeyFn: id => getIsGeneratingAssocKey(id, state),
      isDecrypting: getIsDecrypting(state),
      envsAreDecrypted: getEnvsAreDecrypted(state),
      envAccessGranted: getEnvAccessGranted(state)
    }
  }

  const mapDispatchToProps = (dispatch, ownProps) => {
    const parent = ownProps.app,
          assocParams = {parent, parentType: "app", assocType: "appUser", parentId: parent.id}
    return {
      generateKey: targetId => dispatch(generateKey({...assocParams, targetId})),
      decrypt: password => dispatch(decrypt(password))
    }
  }

export default connect(mapStateToProps, mapDispatchToProps)(DevKeyManager)

