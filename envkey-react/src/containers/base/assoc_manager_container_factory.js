import React from 'react'
import { connect } from 'react-redux'
import columnsConfig from 'lib/columns/columns_config'
import {
  addAssoc,
  createAssoc,
  removeAssoc,
  generateKey,
  revokeKey,
  createObject,
  clearGeneratedAssocKey,
  regenInvite,
  revokeInvite
} from 'actions'
import {
  getIsRemovingById,
  getIsGeneratingAssocKeyById,
  getIsRevokingAssocKeyById,
  getUser,
  getOrgUserForUser,
  getOrgUsers,
  getCurrentUser,
  getCurrentOrg,
  getGeneratedEnvKeysById,
  getIsRevokingInviteByUserId,
  getIsRegeneratingInviteByUserId
} from 'selectors'
import AssocManager from 'components/assoc_manager'
import {getTrueParentAssoc, getJoinType} from "envkey-client-core/dist/lib/assoc/helpers"

export default function({
  AssocManagerClass,
  parentType,
  assocType,
  joinType,
  isManyToMany=false
}){

  const mapStateToProps = (state, ownProps) => {
    const parent = ownProps[parentType]
    return {
      parentType,
      assocType,
      parent,
      joinType: joinType || getJoinType({parentType, assocType, isManyToMany}),
      currentUser: getCurrentUser(state),
      currentOrg: getCurrentOrg(state),
      columnsConfig: columnsConfig({parentType, assocType, parent, state}),
      permissions: state.permissions,
      isRemovingById: getIsRemovingById(state),
      isGeneratingAssocKeyById: getIsGeneratingAssocKeyById(state),
      isRevokingAssocKeyById: getIsRevokingAssocKeyById(state),
      generatedEnvKeysById: getGeneratedEnvKeysById(state),
      orgUsers: getOrgUsers(state),
      isRevokingInviteByUserId: getIsRevokingInviteByUserId(state),
      isRegeneratingInviteByUserId: getIsRegeneratingInviteByUserId(state),
      getUserFn: userId => getUser(userId, state),
      getOrgUserForUserFn: userId => getOrgUserForUser(userId, state)
    }
  }

  const mapDispatchToProps = (dispatch, ownProps) => {
    const parent = ownProps[parentType],
          baseAssocParams = {parent, parentType, assocType, isManyToMany, joinType, parentId: parent.id},
          getTrueAssocParams = (params={})=> ({
            ...baseAssocParams,
            ...params,
            ...getTrueParentAssoc({...baseAssocParams, ...params})
          })
    return {
      addAssoc: ({ids, role}) => {
        ids.forEach((assocId, i) => {
          dispatch(addAssoc({...getTrueAssocParams({assocId}), role, shouldPrefetchUpdates: i == 0}))
        })
      },
      removeAssoc: ({targetId, assocId}) => dispatch(removeAssoc({...getTrueAssocParams({assocId}), targetId})),
      createAssoc: (params, role) => {
        if ((parentType == "app" && assocType == "user") || (parentType == "user" && assocType == "app")){
          if (params.orgRole == "org_admin"){
            dispatch(createAssoc({...getTrueAssocParams(), params: {...params, role: params.orgRole}, role: params.orgRole, createOnly: true}))
          } else {
            dispatch(createAssoc({...getTrueAssocParams(), params, role}))
          }
        } else if (parentType == "app" && ["server", "localKey"].includes(assocType)){
          dispatch(addAssoc({...baseAssocParams, ...params, role}))
        } else {
          dispatch(createAssoc({...getTrueAssocParams(), params}))
        }

      },
      generateKey: targetId => dispatch(generateKey({...baseAssocParams, targetId})),
      revokeKey: targetId => dispatch(revokeKey({...baseAssocParams, targetId})),
      clearGeneratedAssocKey: targetId => dispatch(clearGeneratedAssocKey(targetId)),
      revokeInvite: userId => dispatch(revokeInvite({userId})),
      regenInvite: userId => dispatch(regenInvite({userId, appId: parent.id}))
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(AssocManagerClass || AssocManager)
}
