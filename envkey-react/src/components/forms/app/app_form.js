import React from 'react'

export default class AppForm extends React.Component {

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
            className="object-form new-form app-form"
            onSubmit={this._onSubmit.bind(this)}>

        <fieldset>
          <input className="app-name"
                 ref="name"
                 placeholder="App Name"
                 required />
        </fieldset>

        <fieldset>{this._renderSubmit()}</fieldset>
      </form>
    )
  }

  _renderSubmit(){
    if(this.props.isSubmitting){
      return <button disabled={true}> Submitting... </button>
    } else {
      return <button> Create App </button>
    }
  }
}