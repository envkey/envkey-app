import React from 'react'
import R from 'ramda'
import moment from 'moment'
import {actionsBySubEnvId} from 'envkey-client-core/dist/lib/actions'
import ActionDisplay from './action_display'
import {RevertPreviewContainer} from  'containers'
import {capitalize} from "envkey-client-core/dist/lib/utils/string"

const envUpdateIdToKey = envUpdateId => envUpdateId.replace(/-/g,"").replace("seeded",""),

      versionToVersionStr = version => ((version.parentIndex || version.parentIndex === 0) ?
        [version.parentIndex + 1, version.index + 1] :
        [version.index + 1, 0]
      ).filter(Boolean).join("."),

      getProcessedAt = (props, version) => {
        if (!version.envUpdateId){
          return null
        }

        const envUpdateIdKey = envUpdateIdToKey(version.envUpdateId)

        let processedAtTs
        if (version.parentId == props.parent.id){
          processedAtTs = R.path(["parent", "envUpdateIdTimestamps", envUpdateIdKey, "timestamp"], props)
        } else {
          processedAtTs = R.path(["configBlocksById", version.parentId, "envUpdateIdTimestamps", envUpdateIdKey, "timestamp"], props)

          if (!processedAtTs && props.parentType == "appUser"){
            processedAtTs = R.path(["app", "envUpdateIdTimestamps", envUpdateIdKey, "timestamp"], props)
          }
        }

        return processedAtTs ? moment.utc(processedAtTs) : null
      },

      getIp = (props, version) => {
        if (!version.envUpdateId){
          return null
        }

        const envUpdateIdKey = envUpdateIdToKey(version.envUpdateId)
        return version.parentId == props.parent.id ?
          R.path(["parent", "envUpdateIdTimestamps", envUpdateIdKey, "ip"], props) :
          R.path(["configBlocksById", version.parentId, "envUpdateIdTimestamps", envUpdateIdKey, "ip"], props)
      }

export default class VersionManager extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      selectedEnvUpdateId: R.path(["versions", 0, "envUpdateId"], props),
      revertPreview: false
    }
  }

  componentDidMount(){
    this.props.updateFilters({
      environment: (this.props.localsUserId ? "local" : undefined)
    })
  }

  componentWillReceiveProps(nextProps) {
    if (R.path(["parent", "id"], this.props) != R.path(["parent", "id"], nextProps)){

      // unless toggling between app / user locals or between users, reset filters
      if (!((this.props.parentType == "appUser" && nextProps.parentType == "app") ||
            (this.props.parentType == "app" && nextProps.parentType == "appUser") ||
            (this.props.parentType == "appUser" && nextProps.parentType == "appUser")) ){
        this.props.updateFilters({})
      }

      this.setState({
        revertPreview: false,
        selectedEnvUpdateId: R.path(["versions", 0, "envUpdateId"], nextProps)
      })
    }

    if (!R.equals(this.props.filters, nextProps.filters)){
      this.setState({selectedEnvUpdateId: R.path(["versions", 0, "envUpdateId"], nextProps)})
    }

    if (this.props.versions && this.props.versions.length && !this.state.selectedEnvUpdateId){
      this.setState({selectedEnvUpdateId: nextProps.versions[0].envUpdateId})
    }

    if (this.props.filters.entryKeys &&
        this.props.entryKeys &&
        this.props.filters.entryKeys.some(k => this.props.entryKeys.indexOf(k) == -1)){
      this.props.updateFilters({...this.props.filters, entryKeys: undefined})
    }
  }

  _onSelectEnvironment(e){
    const val = e.target.value

    if (val == "local"){
      this.props.selectLocals(this.props.currentUser.id)
    } else if (this.props.parentType == "appUser"){
      this.props.deselectLocals()
    }

    this.props.updateFilters({
      ...this.props.filters,
      subEnvId: undefined,
      environment: (val == "all" ? undefined : val)
    })
  }

  _classNames(){
    return ["version-manager"]
  }

  _selectedVersion(){
    return R.find(
      R.propEq('envUpdateId', this.state.selectedEnvUpdateId),
      this.props.versions
    )
  }

  render(){
    if (!this.props.parent || !('versions' in this.props)){
      return <div></div>
    }

    return <div className={this._classNames().join(" ")}>
      {this._renderContents()}
    </div>
  }

  _renderContents(){
    if (this.state.revertPreview){
      return <div>
        {this._renderRevertPreview()}
      </div>
    }

    return <div>
      {this._renderHeader()}
      {this._renderVersionDisplay()}
    </div>
  }

  _renderVersionDisplay(){
    if (!this.props.versions || !this.props.versions.length){
      return <div className="empty-versions">
        No versions have been saved yet.
      </div>
    }

    return <div className="version-display">
      {this._renderVersionList()}
      {this._renderVersionDetails()}
    </div>
  }

  _renderHeader(){
    return <header>
      <h2>{this.props.parentLabel} Version History</h2>
      {this._renderFilters()}
    </header>
  }

  _renderFilters(){
    return <div className="version-filters">
      {this._renderEnvironmentFilter()}
      {this._renderSubEnvFilter()}
      {this._renderUserLocalsFilter()}
      {this._renderEntryKeysFilter()}
    </div>
  }

  _renderEnvironmentFilter(){
    const options = [
      <option value="all">{this.props.environments.map(capitalize).join(" + ")}</option>
    ].concat(this.props.environments.map(environment => {
      return <option value={environment}>{capitalize(environment)}</option>
    })).concat([
      <option value="local">Locals</option>
    ])

    return <select
      value={this.props.filters.environment || "all"}
      onChange={::this._onSelectEnvironment}
    >{options}</select>
  }

  _renderSubEnvFilter(){
    if (!this.props.filters.environment ||
        this.props.filters.environment == "local" ||
        R.isEmpty(this.props.subEnvLabelsById)){
      return ""
    }

    const
      options = [
        <option value="none">Base Environment</option>
      ].concat(R.toPairs(this.props.subEnvLabelsById).map(([id, label]) => {
        return <option value={id}>{label}</option>
      }))

    return <select
      value={this.props.filters.subEnvId || "none"}
      onChange={(e)=> this.props.updateFilters({
        ...this.props.filters,
        subEnvId: (e.target.value == "none" ? undefined : e.target.value)
      })}
    >{options}</select>
  }

  _renderUserLocalsFilter(){
    if (this.props.parentType != "appUser"){
      return ""
    }

    const options = this.props.localsUpdatableUsers.map(({id, firstName, lastName, email}) => {
      return <option value={id}>{firstName} {lastName} {`<${email}>`}</option>
    })

    return <select
      value={this.props.localsUserId}
      onChange={(e)=> this.props.selectLocals(e.target.value)}
    >{options}</select>
  }

  _renderEntryKeysFilter(){
    const
      options = [
        <option value="all">All Variables</option>
      ].concat(this.props.entryKeys.map(key => {
        return <option value={key}>{key}</option>
      }))

    return <select
      value={R.head(this.props.filters.entryKeys || []) || "all"}
      onChange={(e)=> this.props.updateFilters({
        ...this.props.filters,
        entryKeys: (e.target.value == "all" ? undefined : [e.target.value])
      })}
    >{options}</select>
  }

  _renderVersionList(){
    return <div className="version-list">
      {this.props.versions.map(::this._renderVersionListItem)}
    </div>
  }

  _renderVersionListItem(version){
    const
      versionStr = versionToVersionStr(version),
      processedAt = getProcessedAt(this.props, version),
      {firstName, lastName} = version.submittedBy

    return <div className="version-item" onClick={()=> this.setState({selectedEnvUpdateId: version.envUpdateId})}>
      <span className="version-str">v{versionStr} </span>
      {this._renderSubVersionParent(version)}
      <span> by </span>
      <span className="submitted-by">{firstName} {lastName} </span>
      <span className="time-ago">{processedAt ? processedAt.fromNow() : ""}</span>
      {this._renderEnvironments(version)}
    </div>
  }

  _renderEnvironments(version){
    if (this.props.filters.environment != "all"){
      const environments = R.keys(version.actionsByEnvironment)
      return <span className="environments"> - {environments.join(", ")}</span>
    }
  }

  _renderSubVersionParent(version){
    if (version.parentIndex){
      const parentBlock = this.props.configBlocksById[version.parentId]
      let s
      if (parentBlock){
        s = parentBlock.name
      } else {
        s = R.keys(version.actionsByEnvironment)[0]
      }

      return <span className="sub-version-source"> via {s}</span>
    }
  }

  _renderVersionDetails(){
    const version = this._selectedVersion()

    return <div className="version-detail">
      {this._renderInfo(version)}
      {this._renderUpdates(version)}
      {this._renderActionButtons(version)}
    </div>
  }

  _renderInfo(version){
    const submittedAt = moment.utc(version.submittedAt),
          processedAt = getProcessedAt(this.props, version),
          {firstName, lastName, email} = version.submittedBy

    return <div className="version-info">
      <div>
        <label>Submitted By: </label>
        <span>{firstName} {lastName} {`<${email}>`}</span>
      </div>
      <div>
        <label>From IP: </label>
        <span>{getIp(this.props, version)}</span>
      </div>
      <div>
        <label>Submitted At: </label>
        <span>{submittedAt.format()}</span>
      </div>
      <div>
        <label>Processed At: </label>
        <span>{processedAt ? processedAt.format() : ""}</span>
      </div>
      <div>
        <label>Commit Message: </label>
        <span>{version.message}</span>
      </div>
    </div>
  }

  _renderUpdates(version){
    const environments = R.keys(version.actionsByEnvironment)
    let content
    if (environments.length == 1){
      content = this._renderEnvironmentUpdates(R.toPairs(version.actionsByEnvironment)[0], false)
    } else if (environments.length > 1) {
      content = R.toPairs(version.actionsByEnvironment).map(([environment, actions])=> {
        return this._renderEnvironmentUpdates([environment, actions], true)
      })
    }

    return <div className="version-updates">{content}</div>
  }

  _renderEnvironmentUpdates([environment, actions], withEnvironmentLabel){
    let environmentLabel = withEnvironmentLabel ? <label>{environment}</label> : ""

    const bySubEnvId = R.pipe(
      actionsBySubEnvId,
      R.toPairs,
      R.sortBy(([subEnvId])=> subEnvId == "base" ? 0 : subEnvId)
    )(actions)

    return <div className="environment-updates">
      {environmentLabel}
      <div className="sub-updates">
        {bySubEnvId.map(::this._renderSubEnvUpdates)}
      </div>
    </div>
  }

  _renderSubEnvUpdates([subEnvId, actions]){
    let subEnvLabel
    if (!(subEnvId == "base" || subEnvId == this.props.filters.subEnvId)){
      subEnvLabel = <label>{this.props.subEnvLabelsById[subEnvId]}</label>
    }

    let content = subEnvLabel ? [subEnvLabel] : []
    content = content.concat(actions.map(action => ActionDisplay(action, this.props.subEnvLabelsById)))

    return <div className="action-updates">{content}</div>
  }

  _renderActionButtons(version){
    if (R.findIndex(R.propEq('envUpdateId', this.state.selectedEnvUpdateId), this.props.versions) > 0){
      const versionStr = versionToVersionStr(version)
      return <div className="version-actions">
        <button onClick={()=> this.setState({revertPreview: true})}>Revert To {versionStr} - Preview Changes</button>
      </div>
    }
  }

  _renderRevertPreview(){
    const version = this._selectedVersion(),
          versionStr = versionToVersionStr(version)

    return <RevertPreviewContainer
      {...this.props}
      versionStr={versionStr}
      back={()=> this.setState({revertPreview: false})}
    />
  }

}

