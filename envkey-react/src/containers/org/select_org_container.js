import { connect } from 'react-redux'
import SelectOrg from 'components/shared/select_org'
import {selectOrg} from 'actions'
import {getCurrentOrg, getOrgs} from 'selectors'

const mapStateToProps = state => {
  return {
    isFetchingOrg: state.isFetchingOrg,
    currentOrg: getCurrentOrg(state),
    orgs: getOrgs(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSelect: (slug) => {
      if(!document.body.className.includes("preloader-authenticate")){
        document.body.className += " preloader-authenticate"
      }
      document.getElementById("preloader-overlay").className = "full-overlay"
      dispatch(selectOrg(slug))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectOrg)