import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import columnsConfig from 'lib/assoc/columns_config'
import {
  createEntry,
  updateEntry,
  removeEntry,
  updateEntryVal,
  addAssoc,
  removeAssoc,
  createAssoc,
  decrypt
} from 'actions'
import {
  getEntries,
  getServicesForApp,
  getCurrentAppUserForApp,
  getCurrentUser,
  getIsUpdatingEnvVal,
  getIsUpdatingEnvEntry,
  getIsCreatingEnvEntry,
  getIsRemoving,
  getIsAddingAssoc,
  getIsCreating,
  getIsDecrypting,
  getEnvsAreDecrypted,
  dissocRelations
} from 'selectors'
import EnvManager from 'components/env_manager'

const withServices = (props, {parentType, parent, state}) => {
  const {
    addFormType,
    addExistingSubmitLabelFn,
    addExistingTextFn,
    addNewLabel,
    addExistingLabel,
    columns: [{
      groups: {services},
      candidates,
      isAddingAssoc,
      isCreating
    }]
  } = columnsConfig({ parentType, parent, state, assocType: "service" })

  return {
    ...props,
    services,
    entriesByServiceId: services.reduce((acc, service)=>{
      return {...acc, [service.id]: getEntries(service.envsWithMeta)}
    }, {}),
    addServiceConfig: {
      addFormType,
      addExistingTextFn,
      addExistingSubmitLabelFn,
      addNewLabel,
      addExistingLabel,
      candidates,
      isAddingAssoc,
      isCreating
    }
  }
}

const EnvManagerContainerFactory = ({parentType})=> {

  const mapStateToProps = (state, ownProps) => {
    const parent = ownProps[parentType],
          parentId = parent.id,
          environments = (parentType == "app" ?
                            getCurrentAppUserForApp(parentId, state).environmentsAccessible :
                            getCurrentUser(state).permittedServiceEnvironments),
          props = {
            envsWithMeta: parent.envsWithMeta,
            entries: getEntries(parent.envsWithMeta),
            isUpdatingValFn: (entryKey, environment)=> getIsUpdatingEnvVal({parentId, entryKey, environment}, state),
            isUpdatingEntryFn: entryKey => getIsUpdatingEnvEntry({parentId, entryKey}, state),
            isCreatingEntry: getIsCreatingEnvEntry(parentId, state),
            isRemovingServiceFn: id => getIsRemoving(id, state),
            isDecrypting: getIsDecrypting(state),
            envsAreDecrypted: getEnvsAreDecrypted(state),
            environments,
            parent,
            parentType
          }

    return parentType == "app" ? withServices(props, {
      parentType,
      parent,
      state
    }) : props
  }

  const mapDispatchToProps = (dispatch, ownProps) => {
    const parent = ownProps[parentType],
          baseProps = {parent, parentType, parentId: parent.id}
    return {
      createEntry: ({entryKey, vals})=> dispatch(createEntry({...baseProps, entryKey, vals })),
      updateEntry: (entryKey, newKey)=> dispatch(updateEntry({...baseProps,  entryKey, newKey})),
      removeEntry: (entryKey)=> dispatch(removeEntry({...baseProps, entryKey})),
      updateEntryVal: (entryKey, environment, update)=> dispatch(updateEntryVal({...baseProps,  entryKey, environment, update})),
      addServices: ({ids})=> {
        ids.forEach(id => {
          dispatch(addAssoc({...baseProps, assocType: "service", isManyToMany: true, assocId: id}))
        })
      },
      removeService: targetId => dispatch(removeAssoc({...baseProps, assocType: "service", isManyToMany: true, targetId})),
      createService: (params)=> dispatch(createAssoc({...baseProps, assocType: "service", isManyToMany: true, params})),
      decrypt: password => dispatch(decrypt(password))
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(EnvManager)
}

export default EnvManagerContainerFactory