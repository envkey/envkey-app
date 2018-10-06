import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import pluralize from 'pluralize'
import SelectedTabs from 'components/shared/selected_tabs'
import {childrenWithProps} from 'lib/ui'
import {capitalize} from 'envkey-client-core/dist/lib/utils/string'
import {
  getCurrentOrg,
  getCurrentUser,
  getAppBySlug,
  getConfigBlockBySlug,
  getUserWithOrgUserBySlug,
  getPermissions,
  getIsDecryptingAllForeground,
  getDecryptedAll,
  getDecryptPrivkeyErr,
  getDecryptAllErr,
  getSelectedObjectType,
  getSelectedObjectId,
  getIsDemo
} from "selectors"
import { decryptAll, selectedObject } from 'actions'
import h from "lib/ui/hyperscript_with_helpers"
import DecryptForm from 'components/shared/decrypt_form'
import DecryptLoader from 'components/shared/decrypt_loader'

const SelectedObjectContainerFactory = ({
  objectType,
  objectPermissionPath=["permissions"]
})=> {

  const idPathFn = R.path([objectType, "id"]),

        triggerSelectedObject = (props)=> {
          if(props.decryptedAll && props[objectType]){
            props.selectedObject(props[objectType])
          }
        }

  class SelectedObjectContainer extends React.Component {

    constructor(props){
      super(props)
      this.state = {showTransitionOverlay: false}
      triggerSelectedObject(props)
    }

    componentWillReceiveProps(nextProps){
      const currentId = idPathFn(this.props),
            nextId = idPathFn(nextProps)

      if (currentId != nextId){
        this.setState({showTransitionOverlay: true})
        setTimeout(()=>{ this.setState({showTransitionOverlay: false}) }, 1)
        triggerSelectedObject(nextProps)
      } else if (!this.props.decryptedAll && nextProps.decryptedAll){
        triggerSelectedObject(nextProps)
      }
    }

    render(){
      let path
      const tabs = R.pluck("path", this.props.route.childRoutes),
            selectedTab = this.props.routes[2].path,
            obj = this.props[objectType]

      if (!obj){
        return <div></div>
      }

      if (objectType == "currentOrg"){
        path = `/${this.props.params.orgSlug}/my_org`
      } else if (objectType == "currentUser"){
        path = `/${this.props.params.orgSlug}/my_account`
      } else {
        path = "/" + [this.props.params.orgSlug, pluralize(objectType), this.props.params.slug].join("/")
      }

      return h.div(".selected-object-container.show-page", {
        className: (objectType == "app" ? `app-role-${obj.role}` : "")
      }, [
        h.div(".transition-overlay", {className: (this.state.showTransitionOverlay ? "" : "hide")}),
        h(SelectedTabs, {
          ...R.pick(["permissions", "isDemo"], this.props),
          objectPermissions: R.path(objectPermissionPath, obj),
          tabs,
          path,
          selectedTab
        }),

        h.div(".selected-object", this._renderContents())
      ])
    }

    _renderContents(){
      const isAccountMenu = ["currentUser", "currentOrg"].includes(objectType)

      if (this.props.isDemo && !this.props.decryptedAll){
        return [h(DecryptLoader, {isDecrypting: true})]
      }

      if(isAccountMenu || this.props.decryptedAll || this.props.isDecrypting){
        return [
          this._renderChildren(),
          (isAccountMenu ? null : h(DecryptLoader, this.props))
        ]
      } else {
        return [h(DecryptForm, {...this.props, onSubmit: this.props.decrypt})]
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
                configBlock: getConfigBlockBySlug,
                user: getUserWithOrgUserBySlug
              }[objectType]

        obj = method(slug, state)
      }

      return {
        [objectType]: obj,
        currentOrg: getCurrentOrg(state),
        permissions: getPermissions(state),
        isDecrypting: getIsDecryptingAllForeground(state),
        isDemo: getIsDemo(state),
        decryptedAll: getDecryptedAll(state),
        decryptPrivkeyErr: getDecryptPrivkeyErr(state),
        decryptAllErr: getDecryptAllErr(state),
        selectedObjectType: getSelectedObjectType(state),
        selectedObjectId: getSelectedObjectId(state)
      }
    },

    mapDispatchToProps = (dispatch, ownProps) => ({
      decrypt: password => dispatch(decryptAll({password})),
      selectedObject: object => dispatch(selectedObject({...object, objectType}))
    })

  return connect(mapStateToProps, mapDispatchToProps)(SelectedObjectContainer)
}

export default SelectedObjectContainerFactory