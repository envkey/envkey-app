import React from 'react'
import SmallLoader from 'components/shared/small_loader'

export default class ServiceForm extends React.Component {

  componentDidMount(){
    this.refs.name.focus();
  }

  componentWillReceiveProps(nextProps){
    if(this.props.isSubmitting && !nextProps.isSubmitting){
      this.refs.form.reset()
      this.refs.name.focus()
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit({name: this.refs.name.value})
  }

  render(){
    return (
      <form ref="form"
            className="keyable-form service-form"
            onSubmit={this._onSubmit.bind(this)}>

        <input className="service-name"
               ref="name"
               placeholder="Service Name"
               required />

        {this._renderSubmit()}
      </form>
    )
  }

  _renderSubmit(){
    if(this.props.isSubmitting){
      return <SmallLoader />
    } else {
      return <button> <span>Create Service</span> </button>;
    }
  }
}