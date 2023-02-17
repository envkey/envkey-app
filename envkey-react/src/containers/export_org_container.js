import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import { connect } from 'react-redux'
import R from 'ramda'
import { exportOrg } from 'actions'
import { getIsExportingOrg, getExportOrgError } from 'selectors'
import SmallLoader from 'components/shared/small_loader'

class ExportOrg extends React.Component {

  constructor(props){
    super(props)
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit()
  }

  render(){
    return <form className="export-org object-form">
      <fieldset>
        <label>Export Org For EnvKey V2</label>
      </fieldset>
      {this._renderSubmit()}
    </form>
  }

  _renderSubmit(){
    if (this.props.isExportingOrg){
      return <SmallLoader />
    } else if (this.props.exportOrgError){
      return <p class="error">
        <strong>There was a problem exporting the archive:</strong>
        {this.props.exportOrgError.message}
        {this.props.exportOrgError.stack}
      </p>
    }
    return <fieldset>
      <button onClick={::this._onSubmit}>Export Org Archive</button>
    </fieldset>
  }
}

const
  mapStateToProps = state => ({
    isExportingOrg: getIsExportingOrg(state),
    exportOrgError: getExportOrgError(state),
  }),

  mapDispatchToProps = dispatch => ({
    onSubmit: params => dispatch(exportOrg())
  })

export default connect(mapStateToProps, mapDispatchToProps)(ExportOrg)