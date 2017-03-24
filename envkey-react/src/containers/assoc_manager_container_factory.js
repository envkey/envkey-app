import React from 'react'
import { connect } from 'react-redux'
import columnsConfig from 'lib/assoc/columns_config'
import {
  addAssoc,
  createAssoc,
  removeAssoc,
  generateKey,
  decrypt
} from 'actions'
import {
  getIsRemoving,
  getIsGeneratingAssocKey,
  getPermissions,
  getUser,
  getIsDecrypting,
  getEnvsAreDecrypted,
  getEnvAccessGranted,
  getCurrentUser,
  getCurrentOrg
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
      envAccessGranted: getEnvAccessGranted(state),
      currentUser: getCurrentUser(state),
      columnsConfig: columnsConfig({parentType, assocType, parent, state}),
      isRemovingFn: id => getIsRemoving(id, state),
      isGeneratingAssocKeyFn: id => getIsGeneratingAssocKey(id, state),
      getUserFn: id => getUser(id, state),
      permissions: getPermissions(state),
      isDecrypting: getIsDecrypting(state),
      envsAreDecrypted: getEnvsAreDecrypted(state)
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
          dispatch(createAssoc({...getTrueAssocParams(), params, role, orgRole: "basic"}))
        } else if (parentType == "app" && assocType == "server"){
          dispatch(addAssoc({...baseAssocParams, ...params, role}))
        } else {
          dispatch(createAssoc({...getTrueAssocParams(), params}))
        }

      },
      generateKey: targetId => dispatch(generateKey({...baseAssocParams, targetId})),
      decrypt: password => dispatch(decrypt(password))
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(AssocManagerClass || AssocManager)
}
