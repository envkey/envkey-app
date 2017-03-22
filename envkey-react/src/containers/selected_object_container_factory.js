import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import pluralize from 'pluralize'
import SelectedTabs from 'components/shared/selected_tabs'
import {childrenWithProps} from 'lib/ui'
import {capitalize} from 'lib/utils/string'
import * as selectors from "selectors"

import h from "lib/ui/hyperscript_with_helpers"

const SelectedObjectContainerFactory = ({objectType})=> {

  class SelectedObjectContainer extends React.Component {

    constructor(props){
      super(props)
      this.state = {showTransitionOverlay: false}
    }

    componentWillReceiveProps(nextProps){
      const pathFn = R.path([objectType, "id"])
      if (pathFn(this.props) != pathFn(nextProps)){
        this.setState({showTransitionOverlay: true})
        setTimeout(()=>{ this.setState({showTransitionOverlay: false}) }, 1)
      }
    }

    render(){
      let path
      const tabs = R.pluck("path", this.props.route.childRoutes),
            selectedTab = this.props.routes[2].path,
            obj = this.props[objectType]

      if (objectType == "currentOrg"){
        path = `/${this.props.params.orgSlug}/my_org`
      } else if (objectType == "currentUser"){
        path = `/${this.props.params.orgSlug}/my_account`
      } else {
        path = "/" + [this.props.params.orgSlug, pluralize(objectType), this.props.params.slug].join("/")
      }

      return h.div(".selected-object-container.show-page", [
        h.div(".transition-overlay", {className: (this.state.showTransitionOverlay ? "" : "hide")}),
        h(SelectedTabs, {...R.pick(["permissions"], this.props), objectPermissions: obj.permissions, tabs, path, selectedTab}),
        childrenWithProps(this.props.children, this.props)
      ])
    }
  }

  const mapStateToProps = (state, ownProps) => {
    let obj

    if (objectType == "currentOrg"){
      obj = selectors.getCurrentOrg(state)
    } else if (objectType == "currentUser"){
      obj = selectors.getCurrentUser(state)
    } else {
      const slug = ownProps.params.slug,
          method = `get${capitalize(pluralize.singular(objectType))}BySlug`

      obj = selectors[method](slug, state)
    }

    return {
      [objectType]: obj,
      permissions: selectors.getPermissions(state)
    }
  }

  return connect(mapStateToProps)(SelectedObjectContainer)
}

export default SelectedObjectContainerFactory