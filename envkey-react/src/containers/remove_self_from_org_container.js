import React from 'react'
import { connect } from 'react-redux'
import SmallLoader from 'components/shared/small_loader'
import {getOrgAdmins, getCurrentUser} from 'selectors'
import {removeSelfFromOrg} from 'actions'

class RemoveSelfFromOrg extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      isConfirming: false
    }
  }

  render(){
    return <div className="remove-self-from-org">


    </div>
  }
}

const
  mapStateToProps = state => ({
    currentUser: getCurrentUser(state),
    orgAdmins: getOrgAdmins(state)
  }),

  mapDispatchToProps = dispatch => ({
    onSubmit: params => dispatch(removeSelfFromOrg(params))
  })

export default connect(mapStateToProps, mapDispatchToProps)(RemoveSelfFromOrg)