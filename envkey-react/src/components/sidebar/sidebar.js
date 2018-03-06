import React from 'react'
import R from 'ramda'
import pluralize from 'pluralize'
import SidebarMenu from './sidebar_menu'
import AccountMenu from './account_menu'
import {ORG_ROLES} from 'constants'
import {orgRoleGroupLabel} from 'lib/ui'
import Filter from 'components/shared/filter'

const defaultAccountMenuExpanded = props => props.location.pathname.includes("/my_org/") || props.location.pathname.includes("/my_account/")

const menuSelected = props => {
  for (let type of ["apps", "users"]){
    ; // fix Sublime highlights
    if(props.location.pathname.indexOf(`/${type}/`) != -1)return type
  }

  return "apps"
}

const defaultState = props => {
  return {
    accountMenuOpen: defaultAccountMenuExpanded(props),
    filter: ""
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

  _onWindowScroll(){
    const scrollX = window.scrollX
    if (scrollX > 0 && this.state.scrollX != scrollX){
      this.setState({scrollX: -scrollX})
    }
  }

  _numApps(){
    return this.props.apps.length
  }

  _numUsers(){
    return R.pipe(R.values, R.flatten)(this.props.users).length
  }

  _numChildren(){
    return this._numApps() + this._numUsers()
  }

  _showFilter(){
    return this._numChildren() > 8
  }


  render(){
    return (
      <div>
        <div className={"sidebar"  +
                       (this.state.accountMenuOpen ? " account-menu-open" : "") +
                       (this._showFilter() ? " show-filter" : "")}>

          <AccountMenu {...this.props}
                       isOpen={this.state.accountMenuOpen}
                       onToggle={()=> this.setState(state => ({accountMenuOpen: !state.accountMenuOpen}))} />

          {this._renderFilter()}

          {this._renderMenuSections()}

        </div>
      </div>
    )
  }

  _renderFilter(){
    if (this._showFilter()){

      return <div className={'filter-row ' + (this.state.accountMenuOpen ? ' hide' : '')}>
        <Filter
          value={this.state.filter}
          onFilter={ filter => this.setState({filter}) }
        />
      </div>
    }
  }

  _renderMenuSections(){
    const selected = menuSelected(this.props)
    return <section className={[
      "menu-sections",
      (this.state.accountMenuOpen ? " hide" : "")
      ].join(" ")}>

      {this._renderMenuListSection("apps",
                                   "Apps",
                                   this.props.apps,
                                   "menu-lightning-white.svg",
                                   {selected: selected == "apps",
                                    pathFn: (item => `/${this.props.currentOrg.slug}/apps/${item.slug}`),
                                    newBtnLabel: "New App"})}

      {this._renderMenuListSection("users",
                                   "Users",
                                   this.props.users,
                                   "menu-user-white.svg",
                                   {selected: selected == "users",
                                    pathFn: (item => `/${this.props.currentOrg.slug}/users/${item.slug}/settings`),
                                    labelFn: (item => [<span key="0">{item.firstName + " "}</span>,
                                                       <strong key="1">{item.lastName}</strong>]),
                                    // newBtnLabel: "Invite User",
                                    groups: R.reverse(ORG_ROLES),
                                    groupLabelFn: orgRoleGroupLabel})}

    </section>
  }


  _renderMenuListSection(type, label, items, icon, componentParams){
    if (this.props.permissions.read[pluralize.singular(type)]){
      return <SidebarMenu {...this.props}
                          {...componentParams}
                          {...{type, items, label, icon}}
                          filter={this.state.filter} />
    }
  }

  // _renderVersion(){
  //   if (window.updater){
  //     return <div className="version"><small>v{window.updater.version}</small></div>
  //   }
  // }

}