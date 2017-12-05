import React from 'react'
import { connect } from 'react-redux'
import {Link} from 'react-router'
import { goBack } from 'react-router-redux'
import R from 'ramda'
import {
  billingUpgradeSubscription,
  billingCancelSubscription
} from "actions"
import {
  getCurrentOrg,
  getCurrentUser,
  getIsUpdatingSubscription,
  getApps,
  getUsers
} from 'selectors'
import {OnboardOverlay} from 'components/onboard'
import Spinner from 'components/shared/spinner'

class DowngradeRemoval extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      selectedUserIds: this._defaultUserIds(),
      selectedAppIds: this._defaultAppIds(),
      confirming: false
    }
  }

  _defaultAppIds(){
    return new Set(R.pluck("id", this._sortedApps().slice(0, this._maxApps())))
  }

  _defaultUserIds(){
    return new Set(R.pluck("id", this._sortedUsers().slice(0, this._maxUsers())))
  }

  _sortedUsers(){
    return R.sortBy(R.prop('orgUserCreatedAt'), this.props.users)
  }

  _sortedApps(){
    return R.sortBy(R.prop('createdAt'), this.props.apps)
  }

  _maxUsers(){
    return this.props.currentOrg.freePlan.maxUsers
  }

  _maxApps(){
    return this.props.currentOrg.freePlan.maxApps
  }

  _onClickUserFn(id){
    return e => {
      if(id == this.props.currentUser.id)return
      const selected = this.state.selectedUserIds
      let updated

      if (selected.has(id)){
        updated = new Set(R.without([id], Array.from(selected)))
      } else {
        if (selected.size == this._maxUsers())return
        updated = new Set([...Array.from(selected), id])
      }

      this.setState({selectedUserIds: updated})
    }
  }

  _onClickAppFn(id){
    return e => {
      const selected = this.state.selectedAppIds
      let updated

      if (selected.has(id)){
        updated = new Set(R.without([id], Array.from(selected)))
      } else {
        if (selected.size == this._maxApps())return
        updated = new Set([...Array.from(selected), id])
      }

      this.setState({selectedAppIds: updated})
    }
  }

  _onConfirm(){
    this.props.cancelSubscription({
      retainUserIds: Array.from(this.state.selectedUserIds),
      retainAppIds: Array.from(this.state.selectedAppIds)
    })
  }

  _onBack(e){
    e.preventDefault()
    this.props.router.goBack()
  }

  render(){
    return <OnboardOverlay>
      <div className="downgrade-removal">
        <h1><em>Downgrade</em> To Free Tier</h1>
        <div className="onboard-auth-form">
          {this._renderContent()}
          {this._renderAction()}
          {this._renderBackLink()}
        </div>
      </div>
    </OnboardOverlay>
  }

  _renderContent(){
    return this.state.confirming ? this._renderConfirm() : this._renderSelect()
  }

  _renderSelect(){
    return <div>
      {this._renderOptLists()}
    </div>
  }

  _renderConfirm(){
    const msgs = [],
          userDiff = this.props.users.length - this.state.selectedUserIds.size,
          appDiff = this.props.apps.length - this.state.selectedAppIds.size

    if (userDiff) msgs.push(`${userDiff} user${userDiff == 1 ? '' : 's'}`)
    if (appDiff) msgs.push(`${appDiff} app${appDiff == 1 ? '' : 's'}`)

    return <div>
      <p>Are you sure? {msgs.join(" and ")} will be removed.</p>
    </div>
  }

  _renderAction(){
    if (this.props.isUpdatingSubscription){
      return <Spinner />
    } else if (this.state.confirming){
      return <div className="actions">
        <button onClick={::this._onConfirm}>Confirm Downgrade</button>
      </div>
    } else {
      return <div className="actions">
        <button onClick={()=> this.setState({confirming: true})}>Downgrade</button>
      </div>
    }
  }

  _renderBackLink(){
    return <Link className="back-link" to={`/${this.props.currentOrg.slug}`} onClick={::this._onBack}>
      <span className="img">←</span>
      <span>Back</span>
    </Link>
  }

  _renderOptLists(){
    return <div className="opt-lists">
      {this._renderUserOptList()}
      {this._renderAppOptList()}
    </div>
  }

  _renderUserOptList(){
    return <div className="opt-list users">
      <header>
        <h3> Keep Users </h3>
        <span className="num-selected">{this.state.selectedUserIds.size}/{this._maxUsers()} selected</span>
      </header>
      <div className="opts">
        {this._sortedUsers().map(::this._renderUserOpt)}
      </div>
    </div>
  }

  _renderUserOpt({firstName, lastName, id}){
    const selected = this.state.selectedUserIds.has(id)
    return <div className={"opt" + (selected ? " selected" : "")} onClick={::this._onClickUserFn(id)}>
      <input type="checkbox"
             checked={selected}
             disabled={id == this.props.currentUser.id} />
      <span>{firstName} {lastName}</span>
    </div>
  }

  _renderAppOptList(){
    return <div className="opt-list apps">
      <header>
        <h3> Keep Apps </h3>
        <span className="num-selected">{this.state.selectedAppIds.size}/{this._maxApps()} selected</span>
      </header>
      <div className="opts">
        {this._sortedApps().map(::this._renderAppOpt)}
      </div>
    </div>
  }

  _renderAppOpt({name, id}){
    const selected = this.state.selectedAppIds.has(id)
    return <div className={"opt" + (selected ? " selected" : "")} onClick={::this._onClickAppFn(id)}>
      <input type="checkbox"
             checked={selected} />
      <span>{name}</span>
    </div>
  }
}

const mapStateToProps = state => {
  return {
    currentUser: getCurrentUser(state),
    currentOrg: getCurrentOrg(state),
    isUpdatingSubscription: getIsUpdatingSubscription(state),
    apps: getApps(state),
    users: getUsers(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    cancelSubscription: params => dispatch(billingCancelSubscription(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DowngradeRemoval)