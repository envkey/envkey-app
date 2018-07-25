import React from 'react'
import R from 'ramda'
import SmallLoader from 'components/shared/small_loader'


export default class InvoiceSettingsForm extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      billingName: props.billingName || "",
      billingEmail: props.billingEmail || "",
      billingAddress: props.billingAddress || "",
      billingVat: props.billingVat || ""
    }
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.updateInvoiceSettings(this.props.id, this.state)
  }

  render(){
    return <form className="settings object-form"
                 onSubmit={::this._onSubmit} >

      <fieldset>
        <label>Organization Legal Name</label>

        <p className="msg">Optional. Your organization's legal name for display on invoices. Defaults to organization name.</p>

        <input type="text"
               placeholder={this.props.name}
               value={this.state.billingName}
               onChange={e => this.setState({billingName: e.target.value})} />
      </fieldset>

      <fieldset>
        <label>Billing Email</label>

        <p className="msg">Optional. Invoices will be sent here. Defaults to Org Owner's email. Displayed on invoices.</p>

        <input type="email"
               placeholder={this.props.ownerEmail}
               value={this.state.billingEmail}
               onChange={e => this.setState({billingEmail: e.target.value})} />
      </fieldset>

      <fieldset>
        <label>Billing Address</label>

        <p className="msg">Optional. Displayed on invoices.</p>

        <textarea value={this.state.billingAddress}
                  onChange={e => this.setState({billingAddress: e.target.value})} />
      </fieldset>

      <fieldset>
        <label>VAT Number</label>

        <p className="msg">Optional. Displayed on invoices.</p>

        <input type="text"
               value={this.state.billingVat}
               onChange={e => this.setState({billingVat: e.target.value})} />
      </fieldset>

      <fieldset>
        {this._renderSubmit()}
      </fieldset>

    </form>
  }

  _renderSubmit(){
    if (this.props.isUpdatingSettings){
      return <SmallLoader />
    } else {
      return <button> <span>Update Invoice Settings</span> </button>
    }
  }
}