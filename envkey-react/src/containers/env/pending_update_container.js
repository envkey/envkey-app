import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import {
  updateEnv
} from 'actions'
import {
  getEnvActionsPendingByEnvUpdateId,
  getEnvUpdateId,
  getIsRequestingEnvUpdateByEnvUpdateId
} from 'selectors'

class PendingUpdate extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      ts: Date.now(),
      message: ""
    }
  }

  _onCommit(e){
    this.props.commit(this.state.message)
  }

  render(){
    return <div className="pending-env-update">
      {this._renderSocket()}
      {this._renderPending()}
      {this._renderRequesting()}
    </div>
  }

  _renderSocket(){

  }

  _renderPending(){
    const {envActionsPendingByEnvUpdateId, currentEnvUpdateId} = this.props,
          envActionsPending = envActionsPendingByEnvUpdateId[currentEnvUpdateId]

    if (envActionsPending && envActionsPending.length){
      return <div className="pending">
        <span>{envActionsPending.length} actions pending</span>
        <textarea value={this.state.message}
                  onChange={e => this.setState({message: e.target.value})}
                  placeholder="Add a commit message (optional)" />

        <button onClick={::this._onCommit}>Commit Changes</button>
      </div>
    }
  }

  _renderRequesting(){
    const {isRequestingEnvUpdateByEnvUpdateId} = this.props

    if (!R.isEmpty(isRequestingEnvUpdateByEnvUpdateId)){
      return <div className="requesting">
        {R.keys(isRequestingEnvUpdateByEnvUpdateId).map(::this._renderRequestingItem)}
      </div>
    }
  }

  _renderRequestingItem(envUpdateId){
    const {envActionsPendingByEnvUpdateId} = this.props,
          envActionsPending = envActionsPendingByEnvUpdateId[envUpdateId]

    if (envActionsPending && envActionsPending.length){
      return <div>
        <span>{envActionsPending.length} actions processing...</span>
      </div>
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  const parent = ownProps[ownProps.parentType]

  return {
    envActionsPendingByEnvUpdateId: getEnvActionsPendingByEnvUpdateId(parent.id, state),
    isRequestingEnvUpdateByEnvUpdateId: getIsRequestingEnvUpdateByEnvUpdateId(parent.id, state),
    currentEnvUpdateId: getEnvUpdateId(parent.id, state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    commit: message => dispatch(updateEnv({message, parentId: ownProps.parent.id}))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PendingUpdate)