import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import SmallLoader from 'components/shared/small_loader'
import OrgRoleSelect from './org_role_select'

const
  defaultState = props => R.pick(["role"], props.orgUser)

export default class OrgUserForm extends React.Component {

  constructor(props){
    super(props)
    this.state = defaultState(props)
  }

  componentWillReceiveProps(nextProps) {
    if(R.path(["orgUser", "id"], this.props) != R.path(["orgUser", "id"], nextProps)){
      this.setState(defaultState(nextProps))
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit(R.pick(["role"],this.state))
  }

  render(){
    return h.form(".object-form.org-user",{
      ref: "form",
      onSubmit: ::this._onSubmit
    }, [

      this._renderOrgRoleSelect(),

      h.fieldset([this._renderSubmit()])
    ])
  }

  _renderOrgRoleSelect(){
    if (this.props.orgRolesAssignable && this.props.orgRolesAssignable.length){
      return h(OrgRoleSelect, {
        value: this.state.role,
        onChange: e => this.setState({role: e.target.value}),
        orgRolesAssignable: this.props.orgRolesAssignable
      })
    }
  }

  _renderSubmit(){
    return this.props.isSubmitting ? h(SmallLoader) : h.button("Update Role")
  }
}