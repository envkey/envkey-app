import React from 'react'
import SmallLoader from 'components/shared/small_loader'

export default class ServerForm extends React.Component {

  componentDidMount(){
    this.refs.name.focus()
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit({name: this.refs.name.value})
  }

  render(){
    return (
      <form className="keyable-form add-server"
            onSubmit={this._onSubmit.bind(this)}>

        <input className="server-name"
               ref="name"
               placeholder="Server Name"
               required />

        {this._renderSubmit()}
      </form>
    )
  }

  _renderSubmit(){
    if(this.props.isSubmitting){
      return <SmallLoader />
    } else {
      return <button> <span>Add Server</span> </button>
    }
  }
}