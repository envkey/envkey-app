import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import R from 'ramda'
import VersionManager from 'components/versions/version_manager'
import {
  getCurrentUser,
  getCurrentOrg,
  getVersions,
  getVersionFilters,
  getConfigBlocksById,
  getEnvironmentLabels,
  getCurrentUserEnvironmentsAssignableForEnvParentUser,
  getUsersForApp,
  getApp,
  getAppUserBy
} from 'selectors'
import {
  updateVersionFilters
} from 'actions'
import {
  flattenVersions,
  subEnvLabelsByIdForVersions,
  allKeysForVersions,
  versionsWithoutSubEnvs
} from 'envkey-client-core/dist/lib/env/version'

const VersionManagerContainerFactory = (factoryParams)=> {

  const
    mapStateToProps = (state, ownProps) => {
      const localsUserId = R.path(["location", "query", "locals"], ownProps)

      let parent, parentType
      if (localsUserId){
        parentType = "appUser"
        parent = getAppUserBy({appId: ownProps.app.id, userId: localsUserId}, state)
      } else {
        parentType = factoryParams.parentType
        parent = ownProps[parentType]
      }

      const filters = getVersionFilters(state),
            versions = getVersions({
              ...filters, parentId: parent.id, recursive: true
            }, state)

      let parentLabel,
          environments,
          environmentsAssignable,
          entryKeys,
          subEnvLabelsById,
          users,
          localsUpdatableUsers

      if (parentType == "appUser"){
        const app = getApp(parent.appId, state)
        parentLabel = app.name
        environments = getEnvironmentLabels(parent.appId, state)
        environmentsAssignable = getCurrentUserEnvironmentsAssignableForEnvParentUser({
          parentType,
          parentId: parent.appId
        }, state)
        subEnvLabelsById = {}
        users = getUsersForApp(parent.appId, state)
      } else {
        parentLabel = parent.name
        environments = getEnvironmentLabels(parent.id, state)
        environmentsAssignable = getCurrentUserEnvironmentsAssignableForEnvParentUser({
          parentType,
          parentId: parent.id
        }, state)
        subEnvLabelsById = subEnvLabelsByIdForVersions(getVersions({
          ...R.omit(["subEnvId", "entryKeys"], filters), parentId: parent.id
        }, state))
      }

      if (parentType == "app"){
        users = getUsersForApp(parent.id, state)
      }

      if (users){
        localsUpdatableUsers = users.filter(R.path(["relation", "permissions", "updateLocalOverrides"]))
      }

      let entryKeyVersions
      if (filters.entryKeys){
        entryKeyVersions = getVersions({
          ...R.omit(["entryKeys"], filters), parentId: parent.id, recursive: true
        }, state)
      } else {
        entryKeyVersions = versions
      }
      if (filters.environment && !filters.subEnvId){
        entryKeyVersions = versionsWithoutSubEnvs(entryKeyVersions)
      }
      entryKeys = allKeysForVersions(entryKeyVersions)

      return {
        parentType,
        parent,
        parentLabel,
        filters,
        environments,
        environmentsAssignable,
        subEnvLabelsById,
        localsUpdatableUsers,
        entryKeys,
        localsUserId,
        currentUser: getCurrentUser(state),
        currentOrg: getCurrentOrg(state),
        versions: R.reverse(flattenVersions(versions)),
        configBlocksById: getConfigBlocksById(state)
      }
    },

    mapDispatchToProps = (dispatch, ownProps) => {
      return {
        updateFilters: p => dispatch(updateVersionFilters(p)),
        selectLocals: userId => dispatch(push({
          pathname: ownProps.location.pathname,
          search: `?locals=${userId}`
        })),
        deselectLocals: ()=> dispatch(push({
          pathname: ownProps.location.pathname,
          search: ""
        }))
      }
    }

  return connect(mapStateToProps, mapDispatchToProps)(VersionManager)
}

export default VersionManagerContainerFactory