import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import moment from 'moment'
import columnsConfig from 'lib/columns/columns_config'
import {
  createEntryRow,
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
  getCurrentUser,
  getCurrentOrg,
  getIsUpdatingEnvVal,
  getIsUpdatingEnvEntry,
  getIsCreatingEnvEntry,
  getIsRemovingById,
  getIsUpdatingEnv,
  getEnvsAreDecrypted,
  getEnvsWithMetaWithPending,
  getIsOnboarding,
  getLastAddedEntry,
  getApps,
  getSocketUserUpdatingEnvs,
  getSocketRemovingEntry,
  getSocketEditingEntry,
  getSocketEditingEntryVal,
  getSocketAddingEntry,
  getIsRequestingEnvUpdate,
  getEnvironmentLabels,
  getDidOnboardImport,
  getCurrentUserEnvironmentsAssignableForEnvParentUser,
  getIsImportingAnyEnvironment,
  getHasEnvActionsPending
} from 'selectors'
import { allEntries } from "envkey-client-core/dist/lib/env/query"
import EnvManager from 'components/env_manager'
import {
  OrgOwnerAppEnvSlider,
  OrgAdminAppEnvSlider,
  AppAdminAppEnvSlider,
  NonAdminAppEnvSlider
} from 'components/onboard'
import {Onboardable} from 'components/onboard'
import {orgRoleIsAdmin, appRoleIsAdmin} from "envkey-client-core/dist/lib/roles"

const EnvManagerContainerFactory = ({parentType})=> {

  const
    mapStateToProps = (state, ownProps) => {
      const parent = ownProps[parentType],
            parentId = parent.id

      if(!parent)return {}

      const currentUser = getCurrentUser(state),
            envsWithMetaWithPending = getEnvsWithMetaWithPending(parentId, state)

      let environments,
          environmentsAssignable

      if (parentType == "appUser"){
        environments = ["local"]
        environmentsAssignable = ["local"]
      } else {
        environments = getEnvironmentLabels(parentId, state)
        environmentsAssignable = getCurrentUserEnvironmentsAssignableForEnvParentUser({
          parentType,
          parentId
        }, state)
      }

      let props = {
        currentOrg: getCurrentOrg(state),
        envsAreDecrypted: getEnvsAreDecrypted(parentId,state),
        envsWithMeta: envsWithMetaWithPending,
        hasEnvsActionsPending: getHasEnvActionsPending(parentId, state),
        isUpdatingEnv: getIsUpdatingEnv(parentId, state),
        isUpdatingValFn: (entryKey, environment)=> getIsUpdatingEnvVal({parentId, entryKey, environment}, state),
        isUpdatingEntryFn: entryKey => getIsUpdatingEnvEntry({parentId, entryKey}, state),
        isCreatingEntry: getIsCreatingEnvEntry(parentId, state),
        isOnboarding: getIsOnboarding(state),
        didOnboardImport: getDidOnboardImport(parentId, state),
        isInvitee: state.isInvitee,
        lastAddedEntry: getLastAddedEntry(parentId, state),
        numApps: getApps(state).length,
        socketUserUpdatingEnvs: getSocketUserUpdatingEnvs(parentId, state),
        socketRemovingEntry: getSocketRemovingEntry(state),
        socketEditingEntry: getSocketEditingEntry(state),
        socketEditingEntryVal: getSocketEditingEntryVal(state),
        socketAddingEntry: getSocketAddingEntry(state),
        isRequestingEnvUpdate: getIsRequestingEnvUpdate(parentId, state),
        isImportingAnyEnvironment: getIsImportingAnyEnvironment(parentId, state),
        environments,
        environmentsAssignable,
        parent,
        parentType
      }

      if (parentType == "app"){
        const {
          addFormType,
          addExistingSubmitLabelFn,
          addExistingTextFn,
          addNewLabel,
          addExistingLabel,
          columns: [{
            groups: {configBlocks},
            candidates,
            isAddingAssoc,
            isCreating
          }]
        } = columnsConfig({ parentType, parent, state, assocType: "configBlock" })

        props = {
          ...props,
          configBlocks,
          isRemovingById: state.isRemoving,
          addBlockConfig: {
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

      return props
    },

    mapDispatchToProps = (dispatch, ownProps) => {
      const parent = ownProps[parentType],
            baseProps = {parent, parentType, parentId: parent.id}
      return {
        dispatch,

        createEntryRow: params => dispatch(createEntryRow({...baseProps, ...params, timestamp: moment().valueOf()})),

        updateEntry: params => dispatch(updateEntry({...baseProps, ...params, timestamp: moment().valueOf()})),

        removeEntry: params => dispatch(removeEntry({...baseProps, ...params})),

        updateEntryVal: params => dispatch(updateEntryVal({...baseProps, ...params})),

        addSubEnv: params => dispatch(addSubEnv({...baseProps, ...params})),

        removeSubEnv: params => dispatch(removeSubEnv({...baseProps, ...params})),

        // renameSubEnv: params => dispatch(renameSubEnv({...baseProps, ...params})),

        editCell: (entryKey, environment, subEnvId)=>{
          if (entryKey && environment){
            dispatch(socketUpdateLocalStatus({editingEntryVal: {[entryKey]: {[environment]: true}}}))
          } else if (entryKey){
            dispatch(socketUpdateLocalStatus({editingEntry: {[entryKey]: {[subEnvId || "@@__base__"]: true}}}))
          }
        },

        stoppedEditing: ()=> dispatch(socketUpdateLocalStatus({})),

        addingEntry: (subEnvId)=> dispatch(socketUpdateLocalStatus({addingEntry: (subEnvId || "@@__base__")})),

        stoppedAddingEntry: ()=> dispatch(socketUpdateLocalStatus({})),

        removeConfigBlock: targetId => dispatch(removeAssoc({...baseProps, targetId, assocType: "appConfigBlock"}))
      }
    }

    let EnvManagerContainer
    if (parentType == "app"){
      const
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
        }

      EnvManagerContainer = Onboardable(
        EnvManager,
        OnboardSlider,
        {startedOnboardingFn, finishedOnboardingFn, selectedIndexFn}
      )
    } else {
      EnvManagerContainer = EnvManager
    }



  return connect(mapStateToProps, mapDispatchToProps)(EnvManagerContainer)
}

export default EnvManagerContainerFactory