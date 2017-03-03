import React from 'react'
import R from 'ramda'
import { Router, Route, IndexRedirect } from 'react-router'
import { Provider } from 'react-redux'
import { routerActions, replace } from 'react-router-redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'
import {history, store} from 'init_redux'
import {
  getAuth,
  getCurrentOrgSlug,
  getOrgs
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
  AcceptInviteContainer
} from 'containers'

const UserAuthenticated = UserAuthWrapper({
  authSelector: getAuth,
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'UserAuthenticated'
})

const OrgsLoaded = UserAuthWrapper({
  authSelector: getOrgs,
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'OrgsLoaded'
})

const OrgSelected = UserAuthWrapper({
  authSelector: getCurrentOrgSlug,
  failureRedirectPath: "/select_org",
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'OrgSelected'
})

export default class Routes extends React.Component {

  redirectIndex(){
    const orgSlug = getCurrentOrgSlug(store.getState())
    if (orgSlug){
      store.dispatch(replace(`/${orgSlug}`))
    } else {
      store.dispatch(replace("/select_org"))
    }
  }

  render(){
    return <Provider store={store}>
      <Router history={history}>
        <Route path="/login" component={LoginContainer} />

        <Route path="/signup" component={RegistrationContainer} />

        <Route path="/accept_invite/:emailbs64/:token" component={AcceptInviteContainer} />

        <Route path="/select_org" component={OrgsLoaded(UserAuthenticated(SelectOrgContainer))} />

        <Route path="/" onEnter={::this.redirectIndex} />

        <Route path="/:orgSlug" component={OrgSelected(UserAuthenticated(MainContainer))}>

          <Route path="apps/new" component={ObjectFormContainerFactory({objectType: "app"})} />

          <Route path="apps/:slug" component={SelectedObjectContainerFactory({objectType: "app"})} >

            <IndexRedirect to="environments" />

            <Route path="environments" component={EnvManagerContainerFactory({parentType: "app"})} />

            <Route path="collaborators" component={AssocManagerContainerFactory({parentType: "app", assocType: "user", isManyToMany: true})} />

            <Route path="servers" component={AssocManagerContainerFactory({parentType: "app", assocType: "server"})} />

            <Route path="integration" />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "app"})}/>

          </Route>

          <Route path="services/new" component={ObjectFormContainerFactory({objectType: "service"})} />

          <Route path="services/:slug" component={SelectedObjectContainerFactory({objectType: "service"})} >

            <IndexRedirect to="environments" />

            <Route path="environments" component={EnvManagerContainerFactory({parentType: "service"})} />

            <Route path="apps" component={AssocManagerContainerFactory({parentType: "service", assocType: "app", isManyToMany: true})} />

            <Route path="settings" component={SettingsFormContainerFactory({objectType: "service"})}/>

          </Route>

          <Route path="users/new" component={ObjectFormContainerFactory({objectType: "user"})} />

          <Route path="users/:slug" component={SelectedObjectContainerFactory({objectType: "user"})} >

            <IndexRedirect to="apps" />

            <Route path="apps" component={AssocManagerContainerFactory({parentType: "user", assocType: "app", isManyToMany: true})} />

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
