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
  addSubEnv,
  removeSubEnv,
  renameSubEnv,
  addAssoc,
  removeAssoc,
  createAssoc,
  socketUpdateLocalStatus
} from 'actions'
import {
  getCurrentAppUserForApp,
  getCurrentUser,
  getCurrentOrg,
  getIsUpdatingEnvVal,
  getIsUpdatingEnvEntry,
  getIsCreatingEnvEntry,
  getIsRemoving,
  getIsAddingAssoc,
  getIsCreating,
  getIsUpdatingEnv,
  getEnvsAreDecrypted,
  getEnvsWithMetaWithPending,
  getIsOnboarding,
  getIsInvitee,
  getLastAddedEntry,
  getApps,
  getApp,
  getSocketUserUpdatingEnvs,
  getSocketRemovingEntry,
  getSocketEditingEntry,
  getSocketEditingEntryVal,
  getSocketAddingEntry,
  getIsRequestingEnvUpdate,
  getEnvironmentLabels,
  getIsUpdatingOutdatedEnvs,
  getIsRebasingOutdatedEnvs,
  getDidOnboardImport,
  getCurrentUserEnvironmentsAssignableForApp,
  getIsImportingAnyEnvironment
} from 'selectors'
import { allEntries } from 'lib/env/query'
import EnvManager from 'components/env_manager'
import {
  OrgOwnerAppEnvSlider,
  OrgAdminAppEnvSlider,
  AppAdminAppEnvSlider,
  NonAdminAppEnvSlider
} from 'components/onboard'
import {Onboardable} from 'components/onboard'
import {orgRoleIsAdmin, appRoleIsAdmin} from 'lib/roles'

const EnvManagerContainerFactory = ({parentType})=> {

  const
    mapStateToProps = (state, ownProps) => {
      const parent = ownProps[parentType],
            appId = parent.id,
            app = getApp(appId, state)

      if(!app)return {}

      const currentUser = getCurrentUser(state),
            environments = getEnvironmentLabels(appId, state),
            envsWithMetaWithPending = getEnvsWithMetaWithPending(parentType, appId, state)

      return {
        currentOrg: getCurrentOrg(state),
        envsAreDecrypted: getEnvsAreDecrypted(appId,state),
        envsWithMeta: envsWithMetaWithPending,
        isUpdatingEnv: getIsUpdatingEnv(appId, state),
        isUpdatingValFn: (entryKey, environment)=> getIsUpdatingEnvVal({appId, entryKey, environment}, state),
        isUpdatingEntryFn: entryKey => getIsUpdatingEnvEntry({appId, entryKey}, state),
        isCreatingEntry: getIsCreatingEnvEntry(appId, state),
        isOnboarding: getIsOnboarding(state),
        didOnboardImport: getDidOnboardImport(appId, state),
        isInvitee: getIsInvitee(state),
        lastAddedEntry: getLastAddedEntry(appId, state),
        numApps: getApps(state).length,
        socketUserUpdatingEnvs: getSocketUserUpdatingEnvs(appId, state),
        socketRemovingEntry: getSocketRemovingEntry(state),
        socketEditingEntry: getSocketEditingEntry(state),
        socketEditingEntryVal: getSocketEditingEntryVal(state),
        socketAddingEntry: getSocketAddingEntry(state),
        isRequestingEnvUpdate: getIsRequestingEnvUpdate(appId, state),
        isUpdatingOutdatedEnvs: getIsUpdatingOutdatedEnvs(appId, state),
        isRebasingOutdatedEnvs: getIsRebasingOutdatedEnvs(appId, state),
        environmentsAssignable: getCurrentUserEnvironmentsAssignableForApp(appId, state),
        isImportingAnyEnvironment: getIsImportingAnyEnvironment(appId, state),
        environments,
        parent,
        parentType
      }
    },

    mapDispatchToProps = (dispatch, ownProps) => {
      const parent = ownProps[parentType],
            baseProps = {parent, parentType, parentId: parent.id}
      return {
        dispatch,
        createEntry: ({entryKey, vals, subEnvId})=> dispatch(createEntry({...baseProps, entryKey, vals, subEnvId, timestamp: moment().valueOf()})),
        updateEntry: (entryKey, newKey, subEnvId)=> dispatch(updateEntry({...baseProps,  entryKey, newKey, subEnvId, timestamp: moment().valueOf()})),
        removeEntry: (entryKey, subEnvId)=> dispatch(removeEntry({...baseProps, entryKey, subEnvId})),
        updateEntryVal: (entryKey, environment, update, subEnvId)=> dispatch(updateEntryVal({...baseProps, entryKey, environment, update, subEnvId})),

        addSubEnv: params => dispatch(addSubEnv({...baseProps, ...params})),
        removeSubEnv: params => dispatch(removeSubEnv({...baseProps, ...params})),
        renameSubEnv: params => dispatch(renameSubEnv({...baseProps, ...params})),

        editCell: (entryKey, environment, subEnvId)=>{
          if (entryKey && environment){
            dispatch(socketUpdateLocalStatus({editingEntryVal: {[entryKey]: {[environment]: true}}}))
          } else if (entryKey){
            dispatch(socketUpdateLocalStatus({editingEntry: {[entryKey]: {[subEnvId || "@@__base__"]: true}}}))
          }
        },

        stoppedEditing: ()=> dispatch(socketUpdateLocalStatus({})),
        addingEntry: (subEnvId)=> dispatch(socketUpdateLocalStatus({addingEntry: (subEnvId || "@@__base__")})),
        stoppedAddingEntry: ()=> dispatch(socketUpdateLocalStatus({}))
      }
    },

    startedOnboardingFn = (props, state)=> {
      if(!props.parent)return false
      return ((props.parent.role == "org_owner" && allEntries(props.envsWithMeta).length == 0) ||
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