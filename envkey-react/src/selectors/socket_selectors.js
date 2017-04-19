import db from 'lib/db'
import { defaultMemoize } from 'reselect'
import R from 'ramda'
import merge from 'lodash/merge'
import {getUser, getSelectedObject, getSelectedObjectType} from './object_selectors'
import {getEnvironmentsAccessible} from './auth_selectors'
import {getEntries, getSelectedParentEnvUpdateId} from './env_selectors'
import {anonymizeEnvStatus, statusKeysToArrays} from 'lib/env/update_status'

const
  getUserByIdFn = state => R.flip(getUser)(state),

  getSocketIsUpdatingEnvs = db("socketIsUpdatingEnvs").find()

export const

  getSocketEnvsStatus = defaultMemoize(state => {
    const mergeWithKeyFn = (k, l, r) => k == 'addingEntry' ? R.concat(l, r) : merge({}, l, r)
    return R.pipe(
      R.mapObjIndexed((byEnvUpdateId, userId)=> {
        const editRemoveEntryEvolveFn = R.pipe(
                R.map(entryKey => ({[entryKey]: getUser(userId, state)})),
                R.mergeAll
              )
        return R.pipe(
          R.map(R.evolve({
            removingEntry: editRemoveEntryEvolveFn,
            editingEntry: editRemoveEntryEvolveFn,
            editingEntryVal: R.pipe(
              R.map(R.curry(R.assocPath)(R.__, getUser(userId, state), {})),
              R.reduce(R.mergeWith(R.merge), {}),
            ),
            addingEntry: R.ifElse(R.identity, R.always([getUser(userId, state)]), R.always([]))
          })),
          R.values,
          R.reduce(R.mergeWithKey(mergeWithKeyFn), {})
        )(byEnvUpdateId)
      }),
      R.values,
      R.reduce(R.mergeWithKey(mergeWithKeyFn), {}),
    )(state.socketEnvsStatus)
  }),

  getSocketUserUpdatingEnvs = R.curry((id, state)=> {
    const userId = getSocketIsUpdatingEnvs(id)(state)
    return userId ? getUser(userId)(state) : null
  }),

  getSocketRemovingEntry = R.pipe(getSocketEnvsStatus, R.propOr({},'removingEntry')),

  getSocketEditingEntry = R.pipe(getSocketEnvsStatus, R.propOr({},'editingEntry')),

  getSocketEditingEntryVal = R.pipe(getSocketEnvsStatus, R.propOr({},'editingEntryVal')),

  getSocketAddingEntry= R.pipe(getSocketEnvsStatus, R.propOr([],'addingEntry')),

  getAnonSocketEnvsStatus = state => {
    const
      parent = getSelectedObject(state),
      parentType = getSelectedObjectType(state),
      envUpdateId = getSelectedParentEnvUpdateId(state),
      environments = getEnvironmentsAccessible(parentType, parent.id, state),
      entries = getEntries(parent.envsWithMeta),
      local = {[envUpdateId]: state.localSocketEnvsStatus},
      merged = merge({}, local, state.pendingLocalSocketEnvsStatus),
      mergedWithStatusKeyArrays = R.map(statusKeysToArrays, merged)

    return anonymizeEnvStatus(mergedWithStatusKeyArrays, entries, environments)
  }
