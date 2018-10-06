import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import LogManager from 'components/logs/log_manager'
import {
  getCurrentUser,
  getCurrentOrg,
  getLogInfo,
  getFetchLogError,
  getIsFetchingLogs,
  getLogEntries
} from 'selectors'
import {
  fetchLogs,
  clearLogs
} from 'actions'

const LogManagerContainerFactory = ({parentType})=> {

  const
    mapStateToProps = (state, ownProps) => {
      const parent = ownProps[parentType]

      return {
        parentType,
        parent,
        currentUser: getCurrentUser(state),
        currentOrg: getCurrentOrg(state),
        isFetchingLogs: getIsFetchingLogs(state),
        fetchLogError: getFetchLogError(state),
        logEntries: getLogEntries(state),
        logInfo: getLogInfo(state)
      }
    },

    mapDispatchToProps = (dispatch, ownProps) => {
      return {
        clearLogs: ()=> dispatch(clearLogs()),
        fetchLogs: p => dispatch(fetchLogs(p))
      }
    }

  return connect(mapStateToProps, mapDispatchToProps)(LogManager)
}

export default LogManagerContainerFactory