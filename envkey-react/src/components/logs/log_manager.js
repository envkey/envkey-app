import React from 'react'
import R from 'ramda'
import moment from 'moment'
import LogEntry from './log_entry'

const PAGE_SIZE=50

const getInitialState = props => ({
  startsAt: moment().add(-1, 'week').valueOf(),
  endsAt: Date.now()
})

export default class LogManager extends React.Component {

  constructor(props){
    super(props)
    this.state = getInitialState(props)
  }

  componentDidMount(){
    this._fetchLogs()
    window.addEventListener('scroll', ::this._onScroll, {passive: true})
  }

  componentWillUnmount(){
    this.props.clearLogs()
    window.removeEventListener('scroll', ::this._onScroll)
  }

  componentWillReceiveProps(nextProps) {
    if (R.path(["parent", "id"], this.props) != R.path(["parent", "id"], nextProps)){
      nextProps.clearLogs()
    }

    if (this.props.logInfo != null && nextProps.logInfo == null){
      this._fetchLogs(nextProps)
    }
  }

  _onScroll(e){
    if (this.props.isFetchingLogs ||
        !this.props.logInfo ||
        this.props.logInfo.pageNum == (this.props.logInfo.pages - 1)){
      return
    }

    const h = document.documentElement,
          b = document.body,
          st = 'scrollTop',
          sh = 'scrollHeight'

    const percent = (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100

    if (percent == 100){
      this._fetchLogs()
    }
  }

  _appIdParams(props=null){
    props = props || this.props
    if (props.parentType == "app"){
      return {appIds: [props.parent.id]}
    } else {
      return {}
    }
  }

  _userIdParams(props=null){
    props = props || this.props
    if (props.parentType == "user"){
      return {userIds: [props.parent.id]}
    } else {
      return {}
    }
  }

  _fetchLogs(props=null){
    props = props || this.props

    if (props.isFetchingLogs){
      return
    }

    const
      pageNum =  props.logInfo ? props.logInfo.pageNum + 1 : 0,
      fetchParams = R.mergeAll([
        {pageNum, pageSize: PAGE_SIZE},
        R.pick(["startsAt", "endsAt"], this.state),
        this._appIdParams(props),
        this._userIdParams(props)
      ])

    props.fetchLogs(fetchParams)
  }

  _classNames(){
    return [
      "log-manager"
    ]
  }

  render(){
    if (!this.props.parent){
      return <div></div>
    }

    return <div className={this._classNames().join(" ")}>
      {this._renderContents()}
    </div>
  }

  _renderContents(){
    return <div>
      {this._renderHeader()}
      {this._renderLogEntries()}
      {this._renderSpinner()}
    </div>
  }

  _renderHeader(){
    return <header>
      {this._renderTitle()}
      {this._renderPageInfo()}
      {this._renderFilters()}
    </header>
  }

  _renderTitle(){
    let lbl
    if (this.props.parentType == "user"){
      lbl = R.props(["firstName", "lastName"], this.props.parent).join(" ")
    } else {
      lbl = this.props.parent.name
    }

    return <label>{lbl} Logs</label>
  }

  _renderPageInfo(){
    if (this.props.logInfo){
      return <div className="page-info">
        <div><em>{this.props.logInfo.count}</em> results</div>
        <div><em>{this.props.logInfo.pages}</em> pages</div>
        <div>Last fetched: <em>{this.props.logInfo.pageNum}</em></div>
      </div>
    }
  }

  _renderFilters(){

  }

  _renderLogEntries(){
    return <div className="log-entries">
      {this.props.logEntries.map(::this._renderLogEntry)}
    </div>
  }

  _renderLogEntry(logEntry){
    return <LogEntry {...this.props} logEntry={logEntry} />
  }

  _renderSpinner(){
    if (this.props.isFetchingLogs){
      return "Loading..."
    }
  }
}

