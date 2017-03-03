import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import SmallLoader from 'components/shared/small_loader'
import {orgRoleLabel} from 'lib/ui'

export default class UserForm extends React.Component {

  constructor(props){
    super(props)
    this.state = this.props.user || {orgRole: "basic"}
  }

  componentDidMount(){
    if(!this.props.user)this.refs.firstName.focus()
  }

  componentWillReceiveProps(nextProps) {
    if(R.path(["user", "id"], this.props) != R.path(["user", "id"], nextProps)){
      this.setState(nextProps.user || {orgRole: "basic"})
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit(R.pick(["firstName", "lastName", "email", "orgRole"],this.state))
  }

  render(){
    return h.form(".keyable-form.invite-new-user",{
      ref: "form",
      onSubmit: ::this._onSubmit
    }, [

      h.input('.first-name', {
        ref: "firstName",
        placeholder: "First Name",
        required: true,
        value: this.state.firstName,
        onChange: e => this.setState({firstName: e.target.value})
      }),

      h.input('.last-name', {
        placeholder: "Last Name",
        required: true,
        value: this.state.lastName,
        onChange: e => this.setState({lastName: e.target.value})
      }),

      h.input('.email', {
        type: "email",
        placeholder: "Email",
        required: true,
        value: this.state.email,
        onChange: e => this.setState({email: e.target.value})
      }),

      this._renderOrgRoleSelect(),

      this._renderSubmit()
    ])
  }

  _renderOrgRoleSelect(){
    if (this.props.orgRolesAssignable && this.props.orgRolesAssignable.length){
      return h.select(".org-role", {
        value: this.state.orgRole,
        onChange: e => this.setState({orgRole: e.target.value})
      }, this.props.orgRolesAssignable.map(::this._renderRoleOption))
    }
  }

  _renderRoleOption(orgRole, i){
    return h.option({key: i, value: orgRole}, orgRoleLabel(orgRole))
  }

  _renderSubmit(){
    return this.props.isSubmitting ?
      h(SmallLoader) :
      h.button([h.span(this.props.user ? "Update User" : "Send Invitation")])
  }
}