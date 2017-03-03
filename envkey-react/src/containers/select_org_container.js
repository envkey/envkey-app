import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import SelectOrg from 'components/shared/select_org'
import {selectOrg} from 'actions'
import {getCurrentOrg, getOrgs, isFetchingOrg} from 'selectors'
import R from 'ramda'

const mapStateToProps = state => {
  return {
    isFetchingOrg: isFetchingOrg(state),
    currentOrg: getCurrentOrg(state),
    orgs: getOrgs(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSelect: (slug) => {
      dispatch(selectOrg(slug))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectOrg)