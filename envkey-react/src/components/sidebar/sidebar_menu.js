import React from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router'
import { imagePath } from 'lib/ui'
import pluralize from 'pluralize'
import R from 'ramda'
import {orgRoleIsAdmin} from "envkey-client-core/lib/roles"

export default class SidebarMenu extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      open: true //this.props.selected || false
    }
  }

  // componentDidMount(){
  //   this._scrollToSelected()
  // }

  // _scrollToSelected(){
  //   if(this.refs.selected){
  //     let containerHeight = this.refs.menuList.clientHeight,
  //         rowHeight = this.refs.selected.clientHeight,
  //         offset = this.refs.selected.offsetTop

  //     if (offset + rowHeight > containerHeight){
  //       this.refs.menuList.scrollTop = (offset + rowHeight)
  //     }
  //   }
  // }

  // componentWillReceiveProps(nextProps) {
  //   if(nextProps.selected != this.props.selected && nextProps.selected != this.state.open){
  //     this.setState({open: nextProps.selected})
  //   }
  // }

  _onClickLabel(){
    if(this._isOrgAdmin())this.setState({open: !this.state.open})
  }

  _label(item){
    return this.props.labelFn ? this.props.labelFn(item) : item.name
  }

  _isOrgAdmin(){
    return orgRoleIsAdmin(this.props.currentUser.role)
  }

  _filteredItems(items){
    if (items && this.props.filter.trim()){
      return items.filter((item)=> {
        const lbl = this._label(item)
        let txt

        if (typeof lbl == "string"){
          txt = lbl
        } else if (typeof lbl == "object") {
          txt = lbl.map(el => el.props.children ).join("")
        }

        return txt.toLowerCase().includes(this.props.filter.toLowerCase().trim())
      })
    } else {
      return items
    }
  }

  render(){
    const filtered = this.props.groups ?
      R.map(::this._filteredItems, this.props.items) :
      this._filteredItems(this.props.items)

    const numItems = this.props.groups ?
      R.pipe(R.values, R.flatten)(filtered).length :
      filtered.length

    return (
      <div className={"side-menu " + this.props.type + (this.state.open ? " open" : "")}>
        {this._renderMenuLabel(filtered, numItems)}
        {this._renderMenuContent(filtered, numItems)}
      </div>
    )
  }

  _renderMenuLabel(filtered, numItems){
    if (numItems > 0){
      return <div className="menu-label"
                  onClick={::this._onClickLabel}>
        {this._renderToggleIcon()}
        <img className="type-icon" src={imagePath(this.props.icon)} />
        <label>{this.props.label}</label>
        <span className="line" />
      </div>
    }
  }

  _renderToggleIcon(){
    if (this._isOrgAdmin()){
      return <img className="toggle-icon" src={imagePath("menu-toggle-black.svg")} />
    }
  }

  _renderMenuContent(filtered, numItems){
    if (this.state.open && numItems > 0){
      return <div className="menu-content">
        {this._renderNewButton()}
        <div className="menu-list">
          {this.props.groups ? this._renderGroups(filtered) :
                               this._renderList(filtered)}
        </div>
      </div>
    }
  }

  _renderGroups(filtered){
    return this.props.groups.map((group, i) => {
      let items =  filtered[group]
      if (items && items.length){
        return (
          <div key={i} className="menu-group">
            <div className="group-label">{this.props.groupLabelFn ? this.props.groupLabelFn(group) : group}</div>
            {this._renderList(items)}
          </div>
        )
      }
    })
  }

  _renderList(items){
    return items.map((item, i)=>{
      let itemSelected = this.props.params.slug == item.slug,
          selectedClass = itemSelected ? "selected" : "",
          arrowIconPath ="menu-right-arrow-white.png",
          path

      if (this.props.location.pathname.includes(`/${this.props.type}/${this.props.params.slug}`)){
        // Don't redirect into subenv for apps (should clean this up)
        if (this.props.location.pathname.includes(`/${this.props.params.slug}/variables/`)){
          path = this.props.pathFn(item)
        } else {
          path = this.props.location.pathname.replace(`/${this.props.type}/${this.props.params.slug}`, `/${this.props.type}/${item.slug}`)
        }
      } else {
        path = this.props.pathFn(item)
      }

      return (
        <Link to={path}
              ref={selectedClass}
              className={["menu-item", selectedClass].join(" ")}
              key={i}>
              <span>{this._label(item)}</span>
              <img src={imagePath(arrowIconPath)} />
        </Link>
      )
    })
  }

  _renderNewButton(){
    if (
      this.props.permissions.create[pluralize.singular(this.props.type)] &&
      this.props.newBtnLabel &&
      !this.props.filter
    ){
      const newSelected = this.props.location.pathname.endsWith(`/${this.props.type}/new`)
      return <Link to={`/${this.props.params.orgSlug}/${this.props.type}/new`}
                   className={"button img-button new-btn" + (newSelected ? " selected" : "")}>
        <img src={imagePath(newSelected ? "circle-plus-white.svg" : "circle-plus-orange.svg")} />
        <span>{this.props.newBtnLabel}</span>
      </Link>
    }
  }
}