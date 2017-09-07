import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import SmallLoader from 'components/shared/small_loader'
import OrgRoleSelect from './org_role_select'
import { SubscriptionWallContainer } from 'containers'

export default class UserForm extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      ...(this.props.user || {}),
      orgRole: "basic"
    }
  }

  componentDidMount(){
    if(!this.props.user && this.refs.firstName)this.refs.firstName.focus()
  }

  componentWillReceiveProps(nextProps) {
    if(R.path(["user", "id"], this.props) != R.path(["user", "id"], nextProps)){
      this.setState({...(nextProps.user || {}), orgRole: "basic"})
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit(R.pick(this._userFields(), this.state))
  }

  _userFields(){
    const fields = ["firstName", "lastName", "orgRole"]
    if (!this.props.readOnlyEmail){
      fields.push("email")
    }
    return fields
  }

  _showSubscriptionWall(){
    return this.props.numUsers && this.props.currentOrg && this.props.numUsers >= this.props.currentOrg.maxUsers
  }

  render(){
    if (this._showSubscriptionWall()){
      return <SubscriptionWallContainer type="user"
                                        max={this.props.currentOrg.maxUsers}
                                        createVerb="invite"
                                        deleteVerb="remove" />
    }

    return h.form(".object-form.new-form.invite-new-user",{
      ref: "form",
      onSubmit: ::this._onSubmit
    }, [

      h.fieldset([
        h.input('.first-name', {
          ref: "firstName",
          placeholder: "First Name",
          required: true,
          value: this.state.firstName,
          onChange: e => this.setState({firstName: e.target.value})
        })
      ]),

      h.fieldset([
        h.input('.last-name', {
          placeholder: "Last Name",
          required: true,
          value: this.state.lastName,
          onChange: e => this.setState({lastName: e.target.value})
        })
      ]),

      this._renderEmailField(),

      this._renderOrgAdminToggle(),

      this._renderOrgRoleSelect(),

      h.fieldset([this._renderSubmit()])
    ])
  }

  _renderOrgAdminToggle(){
    if (this.props.addAssoc && this.props.orgRolesInvitable && this.props.orgRolesInvitable.includes("org_admin")){
      return h.label(".org-admin-toggle", {
        className: (this.state.orgRole == "org_admin" ? "selected" : "")
      }, [
        h.span(this.state.firstName ? ["Make ", h.em(this.state.firstName), " an org admin"] : "Make org admin"),
        h.input({
          type: "checkbox",
          checked: this.state.orgRole == "org_admin",
          onChange: ()=> this.setState({orgRole: (this.state.orgRole == "org_admin" ? "basic" : "org_admin")})
        }),
        h.small("Grant admin access to all your organization's apps.")
      ])
    }
  }

  _renderOrgRoleSelect(){
    if (!this.props.addAssoc && this.props.orgRolesAssignable && this.props.orgRolesAssignable.length){
      return h(OrgRoleSelect, {
        value: this.state.orgRole,
        onChange: e => this.setState({orgRole: e.target.value}),
        orgRolesAssignable: this.props.orgRolesAssignable
      })
    }
  }

  _renderEmailField(){
    return h.fieldset([
      h.input('.email', {
        type: "email",
        placeholder: "Email",
        disabled: this.props.readOnlyEmail,
        required: true,
        value: this.state.email,
        onChange: e => this.setState({email: e.target.value})
      })
    ])
  }

  _renderSubmit(){
    return this.props.isSubmitting ?
      h(SmallLoader) :
      h.button([h.span(this.props.user ? "Update" : "Send Invitation")])
  }


}