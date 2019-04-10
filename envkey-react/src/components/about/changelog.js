import React from "react"
import semver from "semver"
import axios from "axios"
import R from 'ramda'

const renderChange = (change, i) => {
  return <li key={i}>{change}</li>
}

export default class Changelog extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      changes: null
    }
  }

  componentDidMount(){
    this._fetchChanges()
  }

  _fetchChanges(){
    axios.get('https://raw.githubusercontent.com/envkey/envkey-app/master/CHANGELOG.json')
         .then(({data}) => {
           this.setState({changes: data})
         })
  }

  render(){
    return <div className="changelog">
      {this._renderVersions()}
    </div>
  }

  _renderVersions(){
    if (this.state.changes && this.props.version){
      return R.pipe(
        R.keys,
        R.filter(v => semver.gt(v, window.updaterVersion)),
        R.sort((k1,k2) => semver.gt(k1,k2) ? -1 : 1),
        R.map(::this._renderChangeList)
      )(this.state.changes)
    } else {
      return <ul><li>Loading CHANGELOG…</li></ul>
    }
  }

  _renderChangeList(version){
    return <div class="change-list">
      <h5>{version}</h5>
      <ul>{this.state.changes[version].map(renderChange)}</ul>
    </div>
  }


}
