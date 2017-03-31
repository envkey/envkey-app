import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import pluralize from 'pluralize'
import SelectedTabs from 'components/shared/selected_tabs'
import {childrenWithProps} from 'lib/ui'
import {capitalize} from 'lib/utils/string'
import {
  getCurrentOrg,
  getCurrentUser,
  getAppBySlug,
  getServiceBySlug,
  getUserWithOrgUserBySlug,
  getPermissions,
  getIsDecrypting,
  getEnvsAreDecrypted,
  getEnvAccessGranted
} from "selectors"
import { decrypt } from 'actions'
import h from "lib/ui/hyperscript_with_helpers"
import DecryptForm from 'components/shared/decrypt_form'
import DecryptLoader from 'components/shared/decrypt_loader'
import {AwaitingAccessContainer} from 'containers'

const SelectedObjectContainerFactory = ({
  objectType,
  objectPermissionPath=["permissions"]
})=> {

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
        h(SelectedTabs, {
          ...R.pick(["permissions"], this.props),
          objectPermissions: R.path(objectPermissionPath, obj),
          tabs,
          path,
          selectedTab
        }),


        h.div(".selected-object", this._renderContents())
      ])
    }

    _renderContents(){
      if (!this.props.envAccessGranted){
        return [h(AwaitingAccessContainer)]
      } else if(this.props.envsAreDecrypted || this.props.isDecrypting){
        return [
          this._renderChildren(),
          h(DecryptLoader, this.props)
        ]
      }  else {
        return [h(DecryptForm, {onSubmit: this.props.decrypt})]
      }
    }

    _renderChildren(){
      return childrenWithProps(this.props.children, this.props)
    }
  }

  const
    mapStateToProps = (state, ownProps) => {
      let obj

      if (objectType == "currentOrg"){
        obj = getCurrentOrg(state)
      } else if (objectType == "currentUser"){
        obj = getCurrentUser(state)
      } else {
        const slug = ownProps.params.slug,
              method = {
                app: getAppBySlug,
                service: getServiceBySlug,
                user: getUserWithOrgUserBySlug
              }[objectType]

        obj = method(slug, state)
      }

      return {
        [objectType]: obj,
        permissions: getPermissions(state),
        isDecrypting: getIsDecrypting(state),
        envsAreDecrypted: getEnvsAreDecrypted(state),
        envAccessGranted: getEnvAccessGranted(state)
      }
    },

    mapDispatchToProps = (dispatch, ownProps) => ({
      decrypt: password => dispatch(decrypt(password))
    })

  return connect(mapStateToProps, mapDispatchToProps)(SelectedObjectContainer)
}

export default SelectedObjectContainerFactory