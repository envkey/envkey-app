import React from 'react'
import SmallLoader from 'components/shared/small_loader'

export default class OrgForm extends React.Component {

  componentDidMount(){
    this.refs.name.focus()
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit({name: this.refs.name.value})
  }

  render(){
    return (
      <form ref="form"
            className="keyable-form org-form"
            onSubmit={this._onSubmit.bind(this)}>

        <input className="org-name"
               ref="name"
               placeholder="Organization Name"
               required />

        {this._renderSubmit()}
      </form>
    )
  }

  _renderSubmit(){
    if(this.props.isSubmitting){
      return <SmallLoader />
    } else {
      return <button> <span>Create Organization</span> </button>
    }
  }
}