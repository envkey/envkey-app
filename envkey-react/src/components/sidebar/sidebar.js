import React from 'react'
import R from 'ramda'
import pluralize from 'pluralize'
import SidebarMenu from './sidebar_menu'
import AccountMenu from './account_menu'
import {ORG_ROLES} from 'constants'
import {orgRoleGroupLabel} from 'lib/ui'

const defaultAccountMenuExpanded = props => props.location.pathname.includes("/my_org/") || props.location.pathname.includes("/my_account/")

const defaultSelected = props => {
  for (let type of ["apps", "services", "users"]){
    ; // fix Sublime highlights
    if(props.location.pathname.indexOf(`/${type}/`) != -1)return type
  }

  return "apps"
}

const defaultState = props => {
  return {
    accountMenuOpen: defaultAccountMenuExpanded(props)
  }
}

export default class Sidebar extends React.Component {
  constructor(props){
    super(props)
    this.state = defaultState(props)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname != nextProps.location.pathname || !R.equals(this.props.params, nextProps.params)){
      this._reset(nextProps)
    }
  }

  _reset(props){
    this.setState(defaultState(props))
  }

  _onTabClick(type, e){
    this.setState({selected: type, accountMenuOpen: false})
  }

  render(){
    return (
      <div>
        <div className={"sidebar"  +
                       (this.state.accountMenuOpen ? " account-menu-open" : "")} >

          <AccountMenu {...this.props}
                       isOpen={this.state.accountMenuOpen}
                       onToggle={()=> this.setState(state => ({accountMenuOpen: !state.accountMenuOpen}))} />

          {this._renderMenuSections()}

        </div>
      </div>
    )
  }

  _renderMenuSections(){
    const selected = defaultSelected(this.props)
    return <section className={[
      "menu-sections",
      (this.state.accountMenuOpen ? " hide" : "")
      ].join(" ")}>

      {this._renderMenuListSection("apps",
                                   "Apps",
                                   this.props.apps,
                                   "menu-lightning-white.svg",
                                   {defaultOpen: selected == "apps",
                                    pathFn: (item => `/${this.props.currentOrg.slug}/apps/${item.slug}`),
                                    newBtnLabel: "New App"})}

      {this._renderMenuListSection("users",
                                   "Users",
                                   this.props.users,
                                   "menu-user-white.svg",
                                   {defaultOpen: selected == "users",
                                    pathFn: (item => `/${this.props.currentOrg.slug}/users/${item.slug}/apps`),
                                    labelFn: (item => [<span key="0">{item.firstName + " "}</span>,
                                                       <strong key="1">{item.lastName}</strong>]),
                                    newBtnLabel: "Invite User",
                                    groups: R.reverse(ORG_ROLES),
                                    groupLabelFn: orgRoleGroupLabel})}



    </section>
  }

  // {this._renderMenuListSection("services",
  //                                        "Mixin",
  //                                        this.props.services,
  //                                        {pathFn: (item => `/${this.props.currentOrg.slug}/services/${item.slug}`),
  //                                         newBtnLabel: "New Mixin" })}


  _renderMenuListSection(type, label, items, icon, componentParams){
    if (this.props.permissions.read[pluralize.singular(type)]){
      return <SidebarMenu {...this.props}
                          {...componentParams}
                          {...{type, items, label, icon}} />
    }
  }

}