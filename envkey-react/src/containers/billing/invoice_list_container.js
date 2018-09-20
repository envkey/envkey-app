import React from 'react'
import { connect } from 'react-redux'
import {
  billingFetchInvoiceList,
  billingFetchInvoicePdf
} from 'actions'
import {
  getInvoices,
  getIsLoadingInvoices,
  getIsLoadingInvoicePdf
} from 'selectors'
import InvoiceRow from 'components/billing/invoice_row'
import SmallLoader from 'components/shared/small_loader'

class InvoiceList extends React.Component {

  componentDidMount(){
    if (this.props.invoices.length == 0){
      this.props.onLoadInvoices()
    }
  }

  render(){
    if (this.props.isLoadingInvoices){
      return <SmallLoader />
    } else if (this.props.invoices){
      return <table className="invoice-list">
        <thead>
          <tr>
            <th>Date</th>
            <th>Plan</th>
            <th>Active Users</th>
            <th>Total</th>
            <th>Billing Period</th>
            <th>Status</th>
            <th>Reference</th>
            <th></th>
          </tr>
        </thead>
        {this._renderInvoices()}
      </table>
    } else {
      return <table />
    }
  }

  _renderInvoices(){
    return this.props.invoices.map(invoice => {
      return <InvoiceRow {...this.props} invoice={invoice} />
    })
  }
}

const mapStateToProps = state => ({
  invoices: getInvoices(state),
  isLoadingInvoices: getIsLoadingInvoices(state),
  isLoadingInvoicePdf: getIsLoadingInvoicePdf(state)
})

const mapDispatchToProps = dispatch => ({
  onLoadInvoices: () => dispatch(billingFetchInvoiceList()),
  onLoadInvoicePdf: id => dispatch(billingFetchInvoicePdf({id}))
})

export default connect(mapStateToProps, mapDispatchToProps)(InvoiceList)