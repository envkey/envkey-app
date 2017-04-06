import React from 'react'
import { connect } from 'react-redux'
import columnsConfig from 'lib/assoc/columns_config'
import {
  addAssoc,
  createAssoc,
  removeAssoc,
  generateKey,
  createObject
} from 'actions'
import {
  getIsRemovingById,
  getIsGeneratingAssocKeyById,
  getPermissions,
  getUser,
  getCurrentUser,
  getCurrentOrg,
  getIsGrantingEnvAccessByUserId
} from 'selectors'
import AssocManager from 'components/assoc_manager'
import {getTrueParentAssoc, getJoinType} from "lib/assoc/helpers"

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
      columnsConfig: columnsConfig({parentType, assocType, parent, state}),
      permissions: getPermissions(state),
      isRemovingById: getIsRemovingById(state),
      isGeneratingAssocKeyById: getIsGeneratingAssocKeyById(state),
      isGrantingEnvAccessByUserId: getIsGrantingEnvAccessByUserId(state),
      getUserFn: userId => getUser(userId, state)
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
        ids.forEach(assocId => dispatch(addAssoc({...getTrueAssocParams({assocId}), role})))
      },
      removeAssoc: ({targetId, assocId}) => dispatch(removeAssoc({...getTrueAssocParams({assocId}), targetId})),
      createAssoc: (params, role) => {
        if ((parentType == "app" && assocType == "user") || (parentType == "user" && assocType == "app")){
          if (params.orgRole == "org_admin"){
            dispatch(createAssoc({...getTrueAssocParams(), params: {...params, role: params.orgRole}, role: params.orgRole, createOnly: true}))
          } else {
            dispatch(createAssoc({...getTrueAssocParams(), params, role}))
          }
        } else if (parentType == "app" && assocType == "server"){
          dispatch(addAssoc({...baseAssocParams, ...params, role}))
        } else {
          dispatch(createAssoc({...getTrueAssocParams(), params}))
        }

      },
      generateKey: targetId => dispatch(generateKey({...baseAssocParams, targetId}))
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(AssocManagerClass || AssocManager)
}
