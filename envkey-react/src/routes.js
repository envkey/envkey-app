import React from 'react'
import R from 'ramda'
import { Router, Route, IndexRoute, IndexRedirect } from 'react-router'
import { Provider } from 'react-redux'
import { routerActions, replace } from 'react-router-redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'
import {history, store} from 'init_redux'
import {
  getAuth,
  getCurrentOrgSlug,
  getOrgs,
  getPermissions,
  getApps
} from 'selectors'
import {
  MainContainer,
  LoginContainer,
  RegistrationContainer,
  SelectOrgContainer,
  SelectedObjectContainerFactory,
  EnvManagerContainerFactory,
  AssocManagerContainerFactory,
  ObjectFormContainerFactory,
  SettingsFormContainerFactory,
  AcceptInviteContainer,
  DevKeyManagerContainer
} from 'containers'

const
  UserAuthenticated = UserAuthWrapper({
    authSelector: getAuth,
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'UserAuthenticated'
  }),

  OrgsLoaded = UserAuthWrapper({
    authSelector: getOrgs,
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'OrgsLoaded'
  }),

  OrgSelected = UserAuthWrapper({
    authSelector: getCurrentOrgSlug,
    failureRedirectPath: "/select_org",
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'OrgSelected'
  })

  // assocSubRoutes = ()=> {
  //   return <Route path=":role">
  //     <Route path="add">
  //       <Route path="new" />
  //       <Route path="existing" />
  //     </Route>
  //   </Route>
  // }

export default class Routes extends React.Component {

  _redirectIndex(){
    const orgSlug = getCurrentOrgSlug(store.getState())
    if (orgSlug){
      store.dispatch(replace(`/${orgSlug}`))
    } else {
      store.dispatch(replace("/select_org"))
    }
  }

  _redirectOrgIndex(){
    const state = store.getState(),
          orgSlug = getCurrentOrgSlug(state),
          permissions = getPermissions(state),
          apps = getApps(state)

    if (apps.length){
      const {slug} = apps[0]
      store.dispatch(replace(`/${orgSlug}/apps/${slug}`))
    } else if (permissions.create.app){
      store.dispatch(replace(`/${orgSlug}/apps/new`))
    }
  }

  render(){
    return <Provider store={store}>
      <Router history={history}>

        <Route path="/" onEnter={::this._redirectIndex} />

        <Route path="/login" component={LoginContainer} />

        <Route path="/signup" component={RegistrationContainer} />

        <Route path="/accept_invite/:emailbs64/:token" component={AcceptInviteContainer} />

        <Route path="/select_org" component={OrgsLoaded(UserAuthenticated(SelectOrgContainer))} />

        <Route path="/:orgSlug" component={OrgSelected(UserAuthenticated(MainContainer))}>

          <IndexRoute />

          <Route path="apps/new" component={ObjectFormContainerFactory({objectType: "app"})} />

          <Route path="apps/:slug" component={SelectedObjectContainerFactory({objectType: "app"})} >

            <IndexRedirect to="environments" />

            <Route path="environments" component={EnvManagerContainerFactory({parentType: "app"})} />

            <Route path="dev_key" component={DevKeyManagerContainer} />

            <Route path="server_keys" component={AssocManagerContainerFactory({parentType: "app", assocType: "server"})} />

            <Route path="collaborators" component={AssocManagerContainerFactory({parentType: "app", assocType: "user", isManyToMany: true})} />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "app"})}/>

          </Route>

          <Route path="users/new" component={ObjectFormContainerFactory({objectType: "user"})} />

          <Route path="users/:slug" component={SelectedObjectContainerFactory({objectType: "user"})} >

            <IndexRedirect to="apps" />

            <Route path="apps" component={AssocManagerContainerFactory({parentType: "user", assocType: "app", joinType: "appUser", isManyToMany: true})} />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "user"})}/>

          </Route>

          <Route path="my_org" component={SelectedObjectContainerFactory({objectType: "currentOrg"})} >

            <IndexRedirect to="settings" />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "currentOrg"})}/>

          </Route>

          <Route path="my_account" component={SelectedObjectContainerFactory({objectType: "currentUser"})} >

            <IndexRedirect to="settings" />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "currentUser"})}/>

          </Route>

        </Route>

      </Router>
    </Provider>
  }


}


// <Route path="services/new" component={ObjectFormContainerFactory({objectType: "service"})} />

// <Route path="services/:slug" component={SelectedObjectContainerFactory({objectType: "service"})} >

//   <IndexRedirect to="environments" />

//   <Route path="environments" component={EnvManagerContainerFactory({parentType: "service"})} >

//     <Route path="add_var" />

//   </Route>

//   <Route path="apps" component={AssocManagerContainerFactory({parentType: "service", assocType: "app", isManyToMany: true})} >
//     {assocSubRoutes()}
//   </Route>

//   <Route path="settings" component={SettingsFormContainerFactory({objectType: "service"})}/>

// </Route>

