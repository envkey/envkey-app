import React from 'react'
import { connect } from 'react-redux'
import {push} from 'react-router-redux'
import {createObject, importAllEnvironments, removeObject} from 'actions'
import {
  getIsCreating,
  getOnboardAppId,
  getIsImportingAllEnvironments,
  getCurrentOrg,
  getApp,
  getApps,
  getEnvironmentsAccessible,
  getCurrentUser
} from 'selectors'
import {OnboardOverlay} from 'components/onboard'

const
  mapStateToProps = (state, ownProps) => {
    const onboardAppId = getOnboardAppId(state),
          apps = getApps(state),
          app = getApp(onboardAppId, state) || (apps.length == 1 ? apps[0] : null),
          currentOrg = getCurrentOrg(state),
          environments = app ?
            getEnvironmentsAccessible("app", app.id, state) :
            []

    return {
      onboardAppId,
      apps,
      app,
      currentOrg,
      environments,
      currentUser: getCurrentUser(state),
      isCreating: getIsCreating({objectType: "app"},state),
      isImporting: (app ? getIsImportingAllEnvironments(app.id, state) : false)
    }
  },

  mapDispatchToProps = (dispatch, ownProps) => ({ dispatch }),

  mergeProps = (stateProps, dispatchProps, ownProps)=>{
    const {onboardAppId, apps, app, currentOrg} = stateProps,
          {dispatch} = dispatchProps
    return {
      ...stateProps,
      ...dispatchProps,
      ...ownProps,
      createApp: ({willImport, params}) => {
        if (onboardAppId || apps.length == 1){
          dispatch(removeObject({
            objectType: "app",
            targetId: onboardAppId || apps[0].id,
            isOnboardAction: true
          }))
        }
        dispatch(createObject({params, willImport, objectType: "app", isOnboardAction: true}))
      },
      doImport: params => dispatch(importAllEnvironments({
        ...params,
        parentType: "app",
        parentId: app.id,
        isOnboardAction: true
      })),
      skipImport: ()=> dispatch(push(`/${currentOrg.slug}/apps/${app.slug}`))
    }
  }

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(OnboardOverlay)

