import React from 'react'
import {Link} from 'react-router'
import { imagePath } from 'lib/ui'
import pluralize from 'pluralize'
import R from 'ramda'

export default class SidebarMenu extends React.Component {

  componentDidMount(){
    this._scrollToSelected()
  }

  _scrollToSelected(){
    if(this.refs.selected){
      let containerHeight = this.refs.menuList.clientHeight,
          rowHeight = this.refs.selected.clientHeight,
          offset = this.refs.selected.offsetTop

      if (offset + rowHeight > containerHeight){
        this.refs.menuList.scrollTop = (offset + rowHeight)
      }
    }
  }

  _label(item){
    return this.props.labelFn ? this.props.labelFn(item) : item.name
  }

  render(){
    return (
      <div className="side-menu">
        <div ref="menuList" className="menu-list">
          {this.props.groups ? this._renderGroups() :
                               this._renderList(this.props.items)}
        </div>
        {this._renderNewButton()}
      </div>
    )
  }

  _renderGroups(){
    return this.props.groups.map((group, i) => {
      let items = this.props.items[group]
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
      let itemSelected = this.props.selected && this.props.params.slug == item.slug,
          selectedClass = itemSelected ? "selected" : "",
          arrowIconPath ="menu-right-arrow-white.png",
          path = this.props.location.pathname.includes(`/${this.props.type}/${this.props.params.slug}`) ?
            this.props.location.pathname.replace(this.props.params.slug, item.slug) :
            this.props.pathFn(item)

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
    if (this.props.permissions.create[pluralize.singular(this.props.type)]){
      const newSelected = this.props.selected && this.props.location.pathname.endsWith(`/${this.props.type}/new`)
      return <Link to={`/${this.props.params.orgSlug}/${this.props.type}/new`}
                   className={"button img-button new-btn" + (newSelected ? " selected" : "")}>
        <img src={imagePath("circle-plus.png")} />
        <span>{this.props.newBtnLabel}</span>
      </Link>
    }
  }
}