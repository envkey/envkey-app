import React from 'react'
import { connect } from 'react-redux'
import {  generateKey, clearGeneratedAssocKey } from 'actions'
import {
  getIsGeneratingAssocKey,
  getCurrentUser,
  getCurrentAppUserForApp,
  getGeneratedEnvkeysById
} from 'selectors'
import {DevKeyManager} from 'components/assoc_manager'

  const mapStateToProps = (state, ownProps) => {
    const {id: appId} = ownProps.app
    return {
      joinType: "appUser",
      currentUser: getCurrentUser(state),
      assoc: getCurrentAppUserForApp(appId, state),
      isGeneratingAssocKeyFn: id => getIsGeneratingAssocKey(id, state),
      generatedEnvkeysById: getGeneratedEnvkeysById(state)
    }
  }

  const mapDispatchToProps = (dispatch, ownProps) => {
    const parent = ownProps.app,
          assocParams = {parent, parentType: "app", assocType: "appUser", parentId: parent.id}
    return {
      generateKey: targetId => dispatch(generateKey({...assocParams, targetId})),
      clearGeneratedAssocKey: targetId => dispatch(clearGeneratedAssocKey(targetId))
    }
  }

export default connect(mapStateToProps, mapDispatchToProps)(DevKeyManager)

