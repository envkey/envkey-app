import React from 'react'
import SmallLoader from 'components/shared/small_loader'

export default class UserForm extends React.Component {

  componentDidMount(){
    this.refs.firstName.focus()
  }

  componentWillReceiveProps(nextProps){
    if(this.props.isSubmitting && !nextProps.isSubmitting){
      this.refs.form.reset()
      this.refs.firstName.focus()
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit({
      firstName: this.refs.firstName.value,
      lastName: this.refs.lastName.value,
      email: this.refs.email.value
    })
  }

  render(){
    return (
      <form ref="form"
            className="keyable-form invite-new-user"
            onSubmit={this._onSubmit.bind(this)}>

        <input className="first-name"
               ref="firstName"
               placeholder="First Name"
               required />

        <input className="last-name"
               ref="lastName"
               placeholder="Last Name"
               required />

        <input className="email"
               type="email"
               ref="email"
               placeholder="Email"
               required />

        {this._renderSubmit()}
      </form>
    )
  }

  _renderSubmit(){
    if(this.props.isSubmitting){
      return <SmallLoader />
    } else {
      return <button> <span>Send Invitation</span></button>
    }
  }
}