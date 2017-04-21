import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import moment from 'moment'
import columnsConfig from 'lib/assoc/columns_config'
import {
  createEntry,
  updateEntry,
  removeEntry,
  updateEntryVal,
  addAssoc,
  removeAssoc,
  createAssoc,
  socketUpdateLocalStatus
} from 'actions'
import {
  getEntries,
  getCurrentAppUserForApp,
  getCurrentUser,
  getIsUpdatingEnvVal,
  getIsUpdatingEnvEntry,
  getIsCreatingEnvEntry,
  getIsRemoving,
  getIsAddingAssoc,
  getIsCreating,
  getIsUpdatingEnv,
  getEnvsWithMetaWithPending,
  getHasAnyVal,
  getIsOnboarding,
  getIsInvitee,
  getLastAddedEntry,
  getApps,
  getSocketUserUpdatingEnvs,
  getSocketRemovingEntry,
  getSocketEditingEntry,
  getSocketEditingEntryVal,
  getSocketAddingEntry,
  getIsRequestingEnvUpdate,
  getEnvironmentsAccessible,
  getIsUpdatingOutdatedEnvs,
  getIsRebasingOutdatedEnvs,
  getDidOnboardImport
} from 'selectors'
import EnvManager from 'components/env_manager'
import {
  OrgOwnerAppEnvSlider,
  OrgAdminAppEnvSlider,
  AppAdminAppEnvSlider,
  NonAdminAppEnvSlider
} from 'components/onboard'
import {Onboardable} from 'components/onboard'
import {orgRoleIsAdmin, appRoleIsAdmin} from 'lib/roles'

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

  const
    mapStateToProps = (state, ownProps) => {
      const parent = ownProps[parentType],
            parentId = parent.id,
            currentUser = getCurrentUser(state),
            environments = getEnvironmentsAccessible(parentType, parentId, state),
            envsWithMetaWithPending = getEnvsWithMetaWithPending(parentType, parentId, state),
            props = {
              envsWithMeta: envsWithMetaWithPending,
              entries: getEntries(envsWithMetaWithPending),
              isUpdatingEnv: getIsUpdatingEnv(parentId, state),
              isUpdatingValFn: (entryKey, environment)=> getIsUpdatingEnvVal({parentId, entryKey, environment}, state),
              isUpdatingEntryFn: entryKey => getIsUpdatingEnvEntry({parentId, entryKey}, state),
              isCreatingEntry: getIsCreatingEnvEntry(parentId, state),
              isRemovingServiceFn: id => getIsRemoving(id, state),
              hasAnyVal: getHasAnyVal(envsWithMetaWithPending),
              isOnboarding: getIsOnboarding(state),
              didOnboardImport: getDidOnboardImport(parentId, state),
              isInvitee: getIsInvitee(state),
              lastAddedEntry: getLastAddedEntry(parentId, state),
              numApps: getApps(state).length,
              socketUserUpdatingEnvs: getSocketUserUpdatingEnvs(parentId, state),
              socketRemovingEntry: getSocketRemovingEntry(state),
              socketEditingEntry: getSocketEditingEntry(state),
              socketEditingEntryVal: getSocketEditingEntryVal(state),
              socketAddingEntry: getSocketAddingEntry(state),
              isRequestingEnvUpdate: getIsRequestingEnvUpdate(parentId, state),
              isUpdatingOutdatedEnvs: getIsUpdatingOutdatedEnvs(parentId, state),
              isRebasingOutdatedEnvs: getIsRebasingOutdatedEnvs(parentId, state),
              environments,
              parent,
              parentType
            }

      return parentType == "app" ? withServices(props, {
        parentType,
        parent,
        state
      }) : props
    },

    mapDispatchToProps = (dispatch, ownProps) => {
      const parent = ownProps[parentType],
            baseProps = {parent, parentType, parentId: parent.id}
      return {
        dispatch,
        createEntry: ({entryKey, vals})=> dispatch(createEntry({...baseProps, entryKey, vals, timestamp: moment().valueOf()})),
        updateEntry: (entryKey, newKey)=> dispatch(updateEntry({...baseProps,  entryKey, newKey, timestamp: moment().valueOf()})),
        removeEntry: (entryKey)=> dispatch(removeEntry({...baseProps, entryKey})),
        updateEntryVal: (entryKey, environment, update)=> dispatch(updateEntryVal({...baseProps,  entryKey, environment, update})),
        addServices: ({ids})=> {
          ids.forEach(id => {
            dispatch(addAssoc({...baseProps, assocType: "service", isManyToMany: true, assocId: id}))
          })
        },
        removeService: targetId => dispatch(removeAssoc({...baseProps, assocType: "service", isManyToMany: true, targetId})),
        createService: (params)=> dispatch(createAssoc({...baseProps, assocType: "service", isManyToMany: true, params})),
        editCell: (entryKey, environment)=>{
          if (entryKey && environment){
            dispatch(socketUpdateLocalStatus({editingEntryVal: {[entryKey]: {[environment]: true}}}))
          } else if (entryKey){
            dispatch(socketUpdateLocalStatus({editingEntry: {[entryKey]: true}}))
          }
        },

        stoppedEditing: ()=> dispatch(socketUpdateLocalStatus({})),

        addingEntry: ()=> dispatch(socketUpdateLocalStatus({addingEntry: true})),

        stoppedAddingEntry: ()=> dispatch(socketUpdateLocalStatus({}))
      }
    },

    startedOnboardingFn = (props, state)=> {
      return ((props.parent.role == "org_owner" && props.entries.length == 0) ||
              (props.parent.role != "org_owner" && props.isInvitee && !props.lastAddedEntry) ||
              props.didOnboardImport) &&
              props.numApps < 2 &&
             !state.finishedOnboarding
    },

    finishedOnboardingFn = (props, state)=> {
      return props.lastAddedEntry
    },

    selectedIndexFn = (props, state)=> {
      return props.lastAddedEntry ? 1 : 0
    },

    OnboardSlider = props => {
      if(props.parent.role == "org_owner"){
        return OrgOwnerAppEnvSlider(props)
      } else if (props.parent.role == "org_admin"){
        return OrgAdminAppEnvSlider(props)
      } else if (appRoleIsAdmin(props.parent.role)){
        return AppAdminAppEnvSlider(props)
      } else {
        return NonAdminAppEnvSlider(props)
      }
    },

    OnboardableEnvManager = Onboardable(
      EnvManager,
      OnboardSlider,
      {startedOnboardingFn, finishedOnboardingFn, selectedIndexFn}
    )

  return connect(mapStateToProps, mapDispatchToProps)(OnboardableEnvManager)
}

export default EnvManagerContainerFactory