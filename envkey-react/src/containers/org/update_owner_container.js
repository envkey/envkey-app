import React from 'react'
import R from 'ramda'
import { connect } from 'react-redux'
import SmallLoader from 'components/shared/small_loader'
import {getOrgAdmins, getIsUpdatingOrgOwner, getCurrentOrg} from 'selectors'
import {updateOrgOwner} from 'actions'

class UpdateOwner extends React.Component {

  constructor(props){
    super(props)
    this.state = { newOwnerId: null }
  }

  _onSelect(e){
   this.setState({newOwnerId: e.target.value})
  }

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit(R.pick(["newOwnerId"], this.state))
  }

  render(){
    return <form className="update-owner object-form">
      <fieldset>
        <label>Change Org Owner</label>
        {this._renderContent()}
      </fieldset>
      {this._renderSubmit()}
    </form>
  }

  _renderContent(){
    if (this.props.orgAdmins.length){
      return this._renderSelectAdmin()
    } else {
      return this._renderNoAdmins()
    }
  }

  _renderNoAdmins(){
    return <p>
      Only an Org Admin can be made an Org Owner. {this.props.currentOrg.name} has no active Org Admins.
    </p>
  }

  _renderSelectAdmin(){
    return <div>
      <select onChange={::this._onSelect}>{this._renderAdminOpts()}</select>
    </div>
  }

  _renderAdminOpts(){
    return [<option key={0} disabled={true} selected={true} value="">Choose an Org Admin</option>].concat(
      this.props.orgAdmins.map(({id, firstName, lastName}, i)=>{
        return <option key={i+1} value={id} >{firstName} {lastName}</option>
      })
    )
  }

  _renderSubmit(){
    if (this.props.orgAdmins.length){
      if (this.props.isUpdatingOrgOwner){
        return <SmallLoader />
      }
      return <fieldset>
        <button onClick={::this._onSubmit} disabled={this.state.newOwnerId == null}>Change Owner</button>
      </fieldset>
    }
  }
}

const
  mapStateToProps = state => ({
    currentOrg: getCurrentOrg(state),
    isUpdatingOrgOwner: getIsUpdatingOrgOwner(state),
    orgAdmins: getOrgAdmins(state)
  }),

  mapDispatchToProps = dispatch => ({
    onSubmit: params => dispatch(updateOrgOwner(params))
  })

export default connect(mapStateToProps, mapDispatchToProps)(UpdateOwner)