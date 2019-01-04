import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import { revertToVersion } from 'actions'
import {
  getRevertPlan
} from 'selectors'
import {RadioGroup, Radio} from 'react-radio-group'

const
  renderDiffUpdate = (path, {val, inherits})=>{
    let content
    if (inherits){
      return <em>inherits:{val}</em>
    } else if (val === "") {
      return <em>empty string</em>
    } else if (!val){
      return <em>undefined</em>
    } else {
      return <em>{val}</em>
    }
  },

  renderDiff = ({kind, path, lhs, rhs})=>{
    const isSub = path[0] == "@@__sub__"
    let content

    if (isSub){
      if (kind === "N"){
        const subEnvLabel = this.props.subEnvLabelsById[rhs]
        content = [
          <span>Add sub-environment </span>,
          <em>{subEnvLabel}</em>
        ]
      } else if (kind === "D"){
        const subEnvLabel = this.props.subEnvLabelsById[lhs]
        content = [
          <span>Remove sub-environment </span>,
          <em>{subEnvLabel}</em>
        ]
      }
    } else {
      const key = path[0]
      if (kind === "E" && (lhs === "" || lhs) && (rhs === "" || rhs)) {
        content = [
          <span>Change </span>,
          <em>{key}</em>,
          <span> from </span>,
          renderDiffUpdate(path, lhs),
          <span> to </span>,
          renderDiffUpdate(path, rhs)
        ]
      } else if (kind === "N" || (kind === "E" && !lhs)){
        content = [
          <span>Set </span>,
          <em>{key}</em>,
          <span> to </span>,
          renderDiffUpdate(path, rhs)
        ]
      } else if (kind === "D" || (kind === "E" && !rhs)){
        content = [
          <span>Remove </span>,
          <em>{key}</em>
        ]
      }
    }

    return <div className="diff">{content}</div>
  },

  canRevertRecursive = props => !R.equals(props.shallowRevertPlan, props.recursiveRevertPlan) && R.keys(props.recursiveRevertPlan).length > 0,

  canRevertShallow = props => R.keys(props.shallowRevertPlan).length > 0,

  hasAnyDiffs = plan => R.pipe(
    R.values,
    R.map(R.pipe(
      R.prop('environments'),
      R.values,
      R.map(R.values)
    ))
  )(plan)

class RevertPreview extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      recursive: (canRevertRecursive(props) && props.versionStr.split(".").length > 1) || (canRevertRecursive(props) && !canRevertShallow(props))
    }
  }

  _onOptionChange(val){
    this.setState({recursive: val == "recursive"})
  }

  _onRevert(){
    this.props.revert(this.state.recursive)
    this.props.back()
  }

  render(){
    return <div>
      <button onClick={this.props.back}>Back</button>

      {this._renderRecursiveOpts()}

      {this._renderUpdates()}

      {this._renderRevertAction()}
    </div>
  }

  _renderRecursiveOpts(){
    if (canRevertRecursive(this.props) && canRevertShallow(this.props)){
      return <fieldset className="radio-opts">
        <RadioGroup selectedValue={this.state.recursive ? "recursive" : "shallow"} onChange={::this._onOptionChange}>
          <label>
            <Radio value="shallow" /> <strong>Revert Shallow</strong>
          </label>
          <label>
            <Radio value="recursive" /><strong>Revert Recursive</strong>
          </label>
        </RadioGroup>
      </fieldset>
    }
  }

  _renderUpdates(){
    const revertPlan = this.state.recursive ? this.props.recursiveRevertPlan : this.props.shallowRevertPlan

    return <div className="revert-updates">
      {R.toPairs(revertPlan).map(::this._renderParentUpdates)}
    </div>
  }

  _renderParentUpdates([parentId, {parent, environments}]){
    return <div>
      <h2>{this.props.parentLabel}</h2>
      <div>
        {R.toPairs(environments).map(::this._renderEnvironmentUpdates)}
      </div>
    </div>
  }

  _renderEnvironmentUpdates([environment, bySubEnvId]){
    return <div>
      <h2>{environment}</h2>
      <div>
        {R.toPairs(bySubEnvId).map(::this._renderSubEnvUpdates)}
      </div>
    </div>
  }

  _renderSubEnvUpdates([subEnvId, {versionStr, diffs}]){
    let label
    if (subEnvId != "base"){
      const subEnvLabel = this.props.subEnvLabelsById[subEnvId]
      label = <h2>{subEnvLabel}</h2>
    }

    return <div>
      {label}
      <h3>{versionStr}</h3>
      <div className="diffs">
        {diffs && diffs.length ? diffs.map(renderDiff) : "No changes"}
      </div>
    </div>
  }

  _renderRevertAction(){
    const revertType = this.state.recursive ? "Recursive" : "Shallow",
          lbl = `Revert ${revertType} To v` + this.props.versionStr

    return <div>
      <button onClick={::this._onRevert}>{lbl}</button>
    </div>
  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    shallowRevertPlan: getRevertPlan({
      ...ownProps.filters,
      versionStr: ownProps.versionStr,
      parentId: ownProps.parent.id,
      recursive: false
    }, state),
    recursiveRevertPlan: getRevertPlan({
      ...ownProps.filters,
      versionStr: ownProps.versionStr,
      parentId: ownProps.parent.id,
      recursive: true
    }, state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    revert: recursive => dispatch(revertToVersion({
      ...ownProps.filters,
      versionStr: ownProps.versionStr,
      parentId: ownProps.parent.id,
      recursive
    }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RevertPreview)