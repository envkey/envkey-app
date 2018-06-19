import React from 'react'
import R from 'ramda'
import SmallLoader from 'components/shared/small_loader'
import {secureRandomAlphanumeric} from "envkey-client-core/dist/lib/crypto"

const AWS_REGIONS = [
  ["US East (N. Virgina)", "us-east-1"],
  ["US East (Ohio)", "us-east-2"],
  ["US West (N. California)", "us-west-1"],
  ["US West (Oregon)", "us-west-2"],
  ["Asia Pacific (Tokyo)", "ap-northeast-1"],
  ["Asia Pacific (Seoul)", "ap-northeast-2"],
  ["Asia Pacific (Osaka-Local)", "ap-northeast-3"],
  ["Asia Pacific (Mumbai)", "ap-south-1"],
  ["Asia Pacific (Singapore)", "ap-southeast-1"],
  ["Asia Pacific (Sydney)", "ap-southeast-2"],
  ["Canada (Central)", "ca-central-1"],
  ["China (Beijing)", "cn-north-1"],
  ["EU (Frankfurt)", "eu-central-1"],
  ["EU (Ireland)", "eu-west-1"],
  ["EU (London)", "eu-west-2"],
  ["EU (Paris)", "eu-west-3"],
  ["South America (São Paulo)", "sa-east-1"],
]

export default class S3StorageForm extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      awsRegion: "us-east-1",

      awsBucketDevelopment: null,
      awsAccessKeyDevelopment: null,
      awsSecretDevelopment: null,

      awsBucketProduction: null,
      awsAccessKeyProduction: null,
      awsSecretProduction: null
    }
  }

  componentDidMount(){
    Promise.all([
      secureRandomAlphanumeric(10),
      secureRandomAlphanumeric(10)
    ]).then(([dev, prod])=>{
      this.setState({
        awsBucketDevelopment: `envkey-development-${dev}`,
        awsBucketProduction: `envkey-production-${prod}`
      })
    })
  }

  _onSubmit(e){
    e.preventDefault()
    if (!this._submitDisabled()){
      this.props.onSubmit({
        storageStrategy: "s3",
        ...this.state
      })
    }
  }

  _submitDisabled(){
    return R.pipe(R.values, R.all(R.identity), R.not)(this.state)
  }

  render(){
    return (
      <div className="bg">

        <form ref="form"
              className="object-form s3-storage-form"
              onSubmit={::this._onSubmit}>

          <div className="region-select">
            <fieldset>
              <label>AWS Region</label>
              <p> </p>
              <select selected={this.state.awsRegion}
                      onChange={e => this.setState({awsRegion: e.target.value})} >
                {AWS_REGIONS.map(::this._renderRegionOption)}
              </select>
            </fieldset>
          </div>

          <div className="development-fields">
            <fieldset class="bucket">
              <label>Development Bucket</label>
              <p>{this.state.awsBucketDevelopment}</p>
            </fieldset>

            <fieldset className="credentials">
              <input type="text"
                     value={this.state.awsAccessKeyDevelopment}
                     onChange={e => this.setState({awsAccessKeyDevelopment: e.target.value})}
                     className="access-key"
                     disabled={this.props.isSubmitting}
                     placeholder="Development AWS Access Key" />

              <input type="password"
                     value={this.state.awsSecretKeyDevelopment}
                     onChange={e => this.setState({awsSecretDevelopment: e.target.value})}
                     className="secret-key"
                     disabled={this.props.isSubmitting}
                     placeholder="Development AWS Secret Key" />

            </fieldset>
          </div>

          <div className="production-fields">
            <fieldset class="bucket">
              <label>Production Bucket</label>
              <p>{this.state.awsBucketProduction}</p>
            </fieldset>

            <fieldset className="credentials">
              <input type="text"
                     value={this.state.awsAccessKeyProduction}
                     onChange={e => this.setState({awsAccessKeyProduction: e.target.value})}
                     className="access-key"
                     disabled={this.props.isSubmitting}
                     placeholder="Production AWS Access Key" />

              <input type="password"
                     value={this.state.awsSecretKeyProduction}
                     onChange={e => this.setState({awsSecretProduction: e.target.value})}
                     className="secret-key"
                     disabled={this.props.isSubmitting}
                     placeholder="Production AWS Secret Key" />

            </fieldset>
          </div>

          <button className="cancel" onClick={this.props.onCancel}>Cancel</button>
          {this._renderSubmit()}
        </form>

      </div>
    )
  }

  _renderRegionOption([label, region]){
    return <option value={region}>{region} | {label}</option>
  }

  _renderSubmit(){
    if (this.props.isSubmitting){
      return <SmallLoader />
    } else {
      return <button className="submit" disabled={this._submitDisabled()}> Submit </button>
    }
  }
}

