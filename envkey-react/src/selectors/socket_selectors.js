import db from 'lib/db'
import R from 'ramda'
import {getUser} from './object_selectors'

const
  getUserByIdFn = state => R.flip(getUser)(state),

  getSocketIsUpdatingEnvs = db("socketIsUpdatingEnvs").find(),

  getEditingRemovingUpdateStatusFn = key => state => R.pipe(
    R.path(["socketEnvsStatus", key]),
    R.map(getUserByIdFn(state))
  )(state)

export const

  getSocketUserUpdatingEnvs = (id, state)=> {
    const userId = getSocketIsUpdatingEnvs(id)(state)
    return userId ? getUser(userId)(state) : null
  },

  getSocketRemovingEntry = getEditingRemovingUpdateStatusFn("removingEntry"),

  getSocketEditingEntry = getEditingRemovingUpdateStatusFn("editingEntry"),

  getSocketEditingEntryVal = state => R.pipe(
    R.path(["socketEnvsStatus", "editingEntryVal"]),
    R.toPairs,
    R.map(
      R.pipe(
        R.over(R.lensIndex(0), getUserByIdFn(state)),
        R.concat([{}]),
        R.reverse,
        R.apply(R.assocPath)
      )
    ),
    R.mergeAll
  )(state),

  getSocketAddingEntry = state => R.pipe(
    R.path(["socketEnvsStatus", "addingEntry"]),
    R.keys,
    R.map(getUserByIdFn(state))
  )(state),

  getLocalSocketEnvsStatus = db.path("localSocketEnvsStatus")
