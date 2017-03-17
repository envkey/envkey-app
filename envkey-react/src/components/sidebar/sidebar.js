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
    selected: defaultSelected(props),
    accountMenuExpanded: defaultAccountMenuExpanded(props)
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

  _menuSelectedClass(type){
    return (!this.state.accountMenuExpanded && this.state.selected == type ? "selected" : "")
  }

  _onTabClick(type, e){
    this.setState({selected: type, accountMenuExpanded: false})
  }

  render(){
    return (
      <div>
        <div className={"sidebar"  +
                       (this.state.accountMenuExpanded ? " account-menu-expanded" : "")} >

          <AccountMenu {...this.props}
                       onToggleExpanded={()=> this.setState(state => ({accountMenuExpanded: !state.accountMenuExpanded}))} />

          <section className="menu-sections">

            {this._renderMenuListSection("users",
                                         "User",
                                         this.props.users,
                                         {pathFn: (item => `/${this.props.currentOrg.slug}/users/${item.slug}/apps`),
                                          labelFn: (item => [<span key="0">{item.firstName + " "}</span>,
                                                             <strong key="1">{item.lastName}</strong>]),
                                          newBtnLabel: "Invite User",
                                          groups: R.reverse(ORG_ROLES),
                                          groupLabelFn: orgRoleGroupLabel})}

            {this._renderMenuListSection("apps",
                                         "App",
                                         this.props.apps,
                                         {pathFn: (item => `/${this.props.currentOrg.slug}/apps/${item.slug}/environments`),
                                          newBtnLabel: "New App"})}

          </section>

        </div>
      </div>
    )
  }

  // {this._renderMenuListSection("services",
  //                                        "Mixin",
  //                                        this.props.services,
  //                                        {pathFn: (item => `/${this.props.currentOrg.slug}/services/${item.slug}/environments`),
  //                                         newBtnLabel: "New Mixin" })}

  _renderMenuSection(type, label, contents){
    return <section className={["menu-section",
                                type,
                                this._menuSelectedClass(type)].join(" ")}>
      <div className="menu-tab"
           onClick={this._onTabClick.bind(this, type)}>
        <label>{label}</label>
        <span className="line" />
      </div>
      <div className="menu-content">
        {contents}
      </div>
    </section>
  }

  _renderMenuListSection(type, label, items, componentParams){
    if (this.props.permissions.read[pluralize.singular(type)]){
      let selected = type == this.state.selected,
          menu = <SidebarMenu {...this.props}
                              {...componentParams}
                              selected={selected}
                              type={type}
                              items={items}
                              menuLabel={label} />

      return this._renderMenuSection(type, (label + "s"), menu)
    }
  }

}