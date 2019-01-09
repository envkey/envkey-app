import React from 'react'
import R from 'ramda'
import { Router, Route, IndexRoute, IndexRedirect } from 'react-router'
import { Provider } from 'react-redux'
import { routerActions, replace, push } from 'react-router-redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'
import {history, store} from 'init_redux'
import {
  getCurrentOrgSlug,
  getOrgsLoaded,
  getApps,
  getAccounts
} from 'selectors'
import {
  MainContainer,
  SelectOrgContainer,
  SelectedObjectContainerFactory,
  EnvManagerContainerFactory,
  AssocManagerContainerFactory,
  ObjectFormContainerFactory,
  SettingsFormContainerFactory,
  AcceptInviteContainer,
  KeyManagerContainer,
  OnboardOverlayContainer,
  AppCollaboratorsContainer,
  LoginRegisterContainer,
  InviteFailedContainer,
  BillingContainer,
  HomeMenuContainer,
  RequiresConnection,
  BaseRoute,
  DemoLoginContainer,
  SelectAccountContainer,
  CreateOrgContainer,
  NoAppsContainer,
  DowngradeRemovalContainer,
  ResetAccountContainer,
  AppAllowedIpsContainer,
  OrgAllowedIpsContainer,
  VersionManagerContainerFactory,
  LogManagerContainerFactory,
  CollaboratorLocalsContainer
} from 'containers'
import {OnboardAppForm, OnboardAppImporter} from 'components/onboard'

const
  UserAuthenticated = UserAuthWrapper({
    authSelector: state => state.auth,
    failureRedirectPath: "/home",
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'UserAuthenticated'
  }),

  OrgSelected = UserAuthWrapper({
    authSelector: getCurrentOrgSlug,
    failureRedirectPath: "/select_org",
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'OrgSelected'
  }),

  OrgsLoaded = UserAuthWrapper({
    authSelector: getOrgsLoaded,
    failureRedirectPath: "/select_account",
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'OrgsLoaded',
    predicate: R.identity
  }),

  HasAccount = UserAuthWrapper({
    authSelector: getAccounts,
    failureRedirectPath: "/login",
    redirectAction: routerActions.push,
    wrapperDisplayName: 'HasAccount'
  })

export default class Routes extends React.Component {

  _redirectIndex(){
    const orgSlug = getCurrentOrgSlug(store.getState())
    if (orgSlug){
      store.dispatch(replace(`/${orgSlug}`))
    } else {
      store.dispatch(replace("/home"))
    }
  }

  _redirectOrgIndex(){
    const state = store.getState(),
          lastFetchAt = state.lastFetchAt

    // If no fetch yet, don't redirect
    if(!lastFetchAt)return

    const orgSlug = getCurrentOrgSlug(state),
          permissions = state.permissions,
          apps = getApps(state)

    if (apps.length){
      const {slug} = apps[0]
      store.dispatch(replace(`/${orgSlug}/apps/${slug}`))
    } else if (R.path(["create", "app"], permissions)){
      store.dispatch(replace(`/${orgSlug}/onboard`))
    } else {
      store.dispatch(replace(`/${orgSlug}/no_apps`))
    }
  }

  render(){

    return <Provider store={store}>
      <Router history={history}>

        <Route path="/" onEnter={::this._redirectIndex} />

        <Route path="/home" component={RequiresConnection(BaseRoute(HomeMenuContainer))} />

        <Route path="/login" component={RequiresConnection(BaseRoute(LoginRegisterContainer))} />

        <Route path="/demo/:bs64props" component={RequiresConnection(BaseRoute(DemoLoginContainer))} />

        <Route path="/demo" component={RequiresConnection(BaseRoute(DemoLoginContainer))} />

        <Route path="/accept_invite" component={RequiresConnection(BaseRoute(AcceptInviteContainer))} />

        <Route path="/accept_invite/:inviteToken" component={RequiresConnection(BaseRoute(AcceptInviteContainer))} />

        <Route path="/invite_failed" component={RequiresConnection(BaseRoute(InviteFailedContainer))} />

        <Route path="/select_account" component={RequiresConnection(HasAccount(BaseRoute(SelectAccountContainer)))} />

        <Route path="/select_org" component={RequiresConnection(UserAuthenticated(OrgsLoaded(BaseRoute(SelectOrgContainer))))} />

        <Route path="/create_org" component={RequiresConnection(UserAuthenticated(BaseRoute(CreateOrgContainer)))} />

        <Route path="/reset_account" component={RequiresConnection(UserAuthenticated(OrgsLoaded(BaseRoute(ResetAccountContainer))))} />

        <Route path="/:orgSlug" component={RequiresConnection(OrgSelected(UserAuthenticated(MainContainer)))}>

          <IndexRoute onEnter={this._redirectOrgIndex} />

          <Route path="onboard" component={OnboardOverlayContainer} >

            <IndexRedirect to="1" />

            <Route path="1" component={OnboardAppForm} />

            <Route path="2" component={OnboardAppImporter} />

          </Route>

          <Route path="downgrade_removal" component={DowngradeRemovalContainer} />

          <Route path="no_apps" component={NoAppsContainer} />

          <Route path="apps/new" component={ObjectFormContainerFactory({objectType: "app"})} />

          <Route path="apps/:slug" component={SelectedObjectContainerFactory({objectType: "app"})} >

            <IndexRedirect to="variables" />

            <Route path="variables" component={EnvManagerContainerFactory({parentType: "app"})} />

            <Route path="variables/:sub/:sel" component={EnvManagerContainerFactory({parentType: "app"})} />

            <Route path="keys" component={KeyManagerContainer} />

            <Route path="collaborators" component={AppCollaboratorsContainer} />

            <Route path="collaborators/:userSlug/locals" component={CollaboratorLocalsContainer} />

            <Route path="versions" component={VersionManagerContainerFactory({parentType: "app"})} />

            <Route path="logs" component={LogManagerContainerFactory({parentType: "app"})} />

            <Route path="firewall" component={AppAllowedIpsContainer} />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "app"})}/>

          </Route>

          <Route path="configBlocks/new" component={ObjectFormContainerFactory({objectType: "configBlock"})} />

          <Route path="configBlocks/:slug" component={SelectedObjectContainerFactory({objectType: "configBlock"})} >

            <IndexRedirect to="variables" />

            <Route path="variables" component={EnvManagerContainerFactory({parentType: "configBlock"})} />

            <Route path="apps" component={AssocManagerContainerFactory({parentType: "configBlock", assocType: "app", joinType: "appConfigBlock", isManyToMany: true})} />

            <Route path="versions" component={VersionManagerContainerFactory({parentType: "configBlock"})} />

            <Route path="logs" component={LogManagerContainerFactory({parentType: "configBlock"})} />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "configBlock"})}/>

          </Route>

          <Route path="users/new" component={ObjectFormContainerFactory({objectType: "user"})} />

          <Route path="users/:slug" component={SelectedObjectContainerFactory({objectType: "user", objectPermissionPath: ["orgUser", "permissions"]})} >

            <IndexRedirect to="settings" />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "user", targetObjectType: "orgUser", targetObjectPath: ["orgUser"]})}/>

            <Route path="apps" component={AssocManagerContainerFactory({parentType: "user", assocType: "app", joinType: "appUser", isManyToMany: true})} />

            <Route path="versions" component={VersionManagerContainerFactory({parentType: "user"})} />

            <Route path="logs" component={LogManagerContainerFactory({parentType: "user"})} />

          </Route>

          <Route path="my_org" component={SelectedObjectContainerFactory({objectType: "currentOrg"})} >

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "currentOrg", targetObjectType: "org"})}/>

            <Route path="versions" component={VersionManagerContainerFactory({parentType: "currentOrg"})} />

            <Route path="logs" component={LogManagerContainerFactory({parentType: "currentOrg"})} />

            <Route path="firewall" component={OrgAllowedIpsContainer} />

            <Route path="billing" component={BillingContainer}/>

          </Route>

          <Route path="my_account" component={SelectedObjectContainerFactory({objectType: "currentUser"})} >

            <IndexRedirect to="settings" />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "currentUser", targetObjectType: "user"})}/>

          </Route>

        </Route>

      </Router>
    </Provider>
  }
}
