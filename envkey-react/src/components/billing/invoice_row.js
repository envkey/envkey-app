import React from 'react'
import moment from 'moment'
import SmallLoader from 'components/shared/small_loader'

export default function({
  invoice,
  isLoadingInvoicePdf,
  onLoadInvoicePdf
}){
  const createdAt = moment(invoice.createdAt).format("YYYY-MM-DD"),
        total = `$${parseInt(invoice.total / 100)}.00`,

        onDownloadClick = e => {
          e.preventDefault()
          onLoadInvoicePdf(invoice.id)
        },

        renderDownload = ()=> {
          if (isLoadingInvoicePdf[invoice.id]){
            return <SmallLoader />
          } else {
            return <a href="#download" onClick={onDownloadClick}>Download</a>
          }
        }

  return <tr className="invoice-row">
    <td>{createdAt}</td>
    <td>{invoice.planName}</td>
    <td>{invoice.numActiveUsers}</td>
    <td>{total}</td>
    <td>{invoice.periodString}</td>
    <td>{invoice.status}</td>
    <td>{invoice.number}</td>
    <td className="download">{renderDownload()}</td>
  </tr>
}


