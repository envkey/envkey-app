import React from 'react'
import { connect } from 'react-redux'
import columnsConfig from 'lib/assoc/columns_config'
import {
  addAssoc,
  createAssoc,
  removeAssoc,
  generateKey
} from 'actions'
import {
  getIsRemoving,
  getIsGeneratingAssocKey,
  getPermissions
} from 'selectors'
import AssocManager from 'components/assoc_manager'

export default function({parentType, assocType, isManyToMany=false}){

  const mapStateToProps = (state, ownProps) => {
    const parent = ownProps[parentType]
    return {
      parentType,
      assocType,
      parent,
      columnsConfig: columnsConfig({parentType, assocType, parent, state}),
      isRemovingFn: id => getIsRemoving(id, state),
      isGeneratingAssocKeyFn: id => getIsGeneratingAssocKey(id, state),
      permissions: getPermissions(state)
    }
  }

  const mapDispatchToProps = (dispatch, ownProps) => {
    const parent = ownProps[parentType],
          assocParams = {parent, parentType, assocType, isManyToMany, parentId: parent.id}
    return {
      addAssoc: ({ids, role}) => {
        ids.forEach(id => dispatch(addAssoc({...assocParams, role, assocId: id})))
      },
      removeAssoc: targetId => dispatch(removeAssoc({...assocParams, targetId})),
      createAssoc: (params, role) => dispatch(createAssoc({...assocParams, params, appRole: role, orgRole: "basic"})),
      generateKey: targetId => dispatch(generateKey({...assocParams, targetId}))
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(AssocManager)
}
