import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import LogManager from 'components/logs/log_manager'
import {
  getCurrentUser,
  getCurrentOrg,
  getFetchLogError,
  getIsFetchingLogs,
  getLogEntries,
  getUsersById,
  getServersById,
  getLocalKeysById
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
        ...R.pick([
          "isFetchingLogs",
          "fetchLogError",
          "logInfo",
        ], state),
        currentUser: getCurrentUser(state),
        currentOrg: getCurrentOrg(state),
        logEntries: getLogEntries(state),
        usersById: getUsersById(state),
        serversById: getServersById(state),
        localKeysById: getLocalKeysById(state)
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