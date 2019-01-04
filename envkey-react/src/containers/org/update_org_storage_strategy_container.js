import React from 'react'
import R from 'ramda'
import { connect } from 'react-redux'
import S3StorageForm from 'components/forms/org/s3_storage_form'
import SmallLoader from 'components/shared/small_loader'
import {getCurrentOrg} from 'selectors'
import {updateOrgStorageStrategy} from 'actions'

class UpdateOrgStorageStrategy extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      confirmCloud: false,
      s3FormOpen: false
    }
  }

  componentWillReceiveProps(nextProps){
    if (this.props.currentOrg.storageStrategy != nextProps.currentOrg.storageStrategy){
      this.setState({confirmCloud: false, s3FormOpen: false})
    }
  }

  _onUpdateFn(strategy){
    return e => {
      if (strategy == "envkey_cloud"){
        this.setState({confirmCloud: true})
      } else if (strategy == "s3") {
        this.setState({s3FormOpen: true})
      }
    }
  }

  _onConfirmCloud(){
    this.setState({confirmCloud: false}, ()=> this.props.onUpdate({storageStrategy: "envkey_cloud"}))
  }

  render(){
    return <div className="update-org-storage-strategy ">
      <form onSubmit={e => e.preventDefault()} className="object-form">
        <label>Encrypted Data Storage</label>
        {this._renderContent()}
      </form>
      {this._renderS3Form()}
    </div>
  }

  _renderContent(){
    if (this.state.confirmCloud){
      return <div className="content confirm-cloud">
        <p>Are you sure you want to switch back to EnvKey Cloud Storage?</p>
        <button className="cancel" onClick={e => this.setState({confirmCloud: false})}>Cancel</button>
        {this._renderConfirmCloud()}
      </div>
    } else {
      return <div className="content">
        <div className="current-storage">
          {this._renderCurrentStorage()}
        </div>

        <div className="update-storage">
          {this._renderUpdateStorage()}
        </div>
      </div>
    }
  }

  _renderCurrentStorage(){
    const strategy = this.props.currentOrg.storageStrategy
    if (strategy == "envkey_cloud"){
      return this._renderCloud()
    } else if (strategy == "s3"){
      return this._renderS3()
    }
  }

  _renderUpdateStorage(){
    const strategy = this.props.currentOrg.storageStrategy
    if (strategy == "envkey_cloud"){
      return this._renderS3(true)
    } else if (strategy == "s3"){
      return this._renderCloud(true)
    }
  }

  _renderCloud(withUpdate){
    return <div>
      <p>EnvKey Secure Cloud Storage</p>
      <small>Your end-to-end encrypted config is stored and kept in sync seamlessly by our servers. EnvKey's zero-knowledge architecture ensures that we have no access to secrets or config.</small>
      {withUpdate ? <button onClick={this._onUpdateFn("envkey_cloud")}>Switch To <strong>EnvKey Cloud</strong></button> : ""}
    </div>
  }

  _renderConfirmCloud(){
    if (this.props.isSubmitting){
      return <SmallLoader />
    } else {
      return <button className="confirm" onClick={::this._onConfirmCloud}>Confirm</button>
    }
  }

  _renderS3(withUpdate){
    return <div>
      <p>Secure S3 Storage In Your AWS Account</p>
      <small>Your end-to-end encrypted config is stored in two S3 buckets in your own AWS account. With this approach, your config data never touches our servers, and you can define bucket policies to control access however you like. </small>
      {withUpdate ? <button onClick={this._onUpdateFn("s3")}>Switch To <strong>S3</strong></button> : ""}
    </div>
  }

  _renderS3Form(){
    if (this.state.s3FormOpen){
      return <S3StorageForm {...this.props} onCancel={e => this.setState({s3FormOpen: false})} />
    }
  }
}

const
  mapStateToProps = state => ({
    currentOrg: getCurrentOrg(state),
    isSubmitting: state.isUpdatingOrgStorageStrategy
  }),

  mapDispatchToProps = dispatch => ({
    onSubmit: params => dispatch(updateOrgStorageStrategy(params))
  })

export default connect(mapStateToProps, mapDispatchToProps)(UpdateOrgStorageStrategy)