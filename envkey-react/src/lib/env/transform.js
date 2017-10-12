import R from 'ramda'
import {inheritedVal} from './inheritance'
import {allKeys, allEntries, subEnvPath} from './query'
import uuid from 'uuid'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,
  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
  RENAME_SUB_ENV
} from 'actions'

const
  getMetaToValFn = (envsWithMeta)=> (meta, entryKey)=>{
    if (meta.inherits){
      return inheritedVal({entryKey, envsWithMeta, inherits: meta.inherits}) || meta.inheritedVal
    } else if (meta.val || meta.val === ""){
      return meta.val
    }
  },

  productionMetaValToLockedProductionVal = ({inherits, hasVal, isUndefined, isEmpty})=>{
    const val = isEmpty ? "" : null
    return {inherits, val, hasVal, locked: true}
  },

  withProductionMetaOnly = envsWithMeta => {
    if(!envsWithMeta.production)return envsWithMeta

    return {
      ...envsWithMeta,
      productionMetaOnly: R.mapObjIndexed(
        (entryVal, entryKey)=> {
          if(!entryVal || entryVal.locked)return R.path(["productionMetaOnly", entryKey], envsWithMeta)
          const {val, inherits} = entryVal
          return {
            inherits,
            hasVal: Boolean(val),
            isUndefined: (!inherits && val === null),
            isEmpty: (!inherits && val === "")
          }
        },
        envsWithMeta.production
      )
    }
  },

  withLockedProduction = envsWithMeta => {
    const entries = allEntries(envsWithMeta),
          productionMetaOnly = envsWithMeta.productionMetaOnly || {},
          prodVals = R.map(
            key => {
              const existingVal = R.path(["production", key], envsWithMeta)
              if (existingVal){
                return {[key]: existingVal}
              } else {
                const lockedVal = productionMetaOnly[key] ?
                  productionMetaValToLockedProductionVal(productionMetaOnly[key]) :
                  {val: null, inherits: null, locked: true, hasVal: !envsWithMeta.productionMetaOnly}

                return {[key]: lockedVal}
              }
            },
            entries
          )

    return {...envsWithMeta, production: R.mergeAll(prodVals)}
  },

  withMissingEntries = envsWithMeta => {
    const entries = allEntries(envsWithMeta),
          withMissing = R.map(env => R.mergeAll(
            R.map(
              key => ({[key]: (env[key] || {val: null, inherits: null})}),
              entries
            )
          ))(R.omit(["productionMetaOnly"], envsWithMeta))

    return {
      ...envsWithMeta,
      ...withMissing
    }
  },

  subEnvUpdatable = updateFn => {
    return params => {
      const {subEnvId, envsWithMeta} = params
      if (subEnvId){
        const path = subEnvPath(subEnvId, envsWithMeta),
              subEnv = R.path(path, envsWithMeta),
              updatedSubEnv = updateFn({
                ...params, envsWithMeta: {[subEnvId]: subEnv}
              })[subEnvId]

        return R.assocPath(path, updatedSubEnv, envsWithMeta)
      } else {
        return updateFn(params)
      }
    }
  }

export const
  normalizeEnvsWithMeta = envsWithMeta => {
    const withNormalizedEntries = R.pipe(
      withMissingEntries,
      withLockedProduction
    )(envsWithMeta)

    return R.mergeDeepRight(envsWithMeta, withNormalizedEntries)
  },

  rawEnv = ({envsWithMeta, environment})=> {
    return R.mapObjIndexed(
      getMetaToValFn(envsWithMeta),
      envsWithMeta[environment]
    )
  },

  createEntry = subEnvUpdatable(({envsWithMeta, entryKey, vals})=>{
    return R.mapObjIndexed(
      (env, name) => {
        return vals[name] ? R.assoc(entryKey, vals[name], env) : env
      },
      envsWithMeta
    )
  }),

  updateEntry = subEnvUpdatable(({envsWithMeta, entryKey, newKey})=>{
    return R.mapObjIndexed(
      (env)=> ({...R.dissoc(entryKey, env), [newKey]: env[entryKey]}),
      envsWithMeta
    )
  }),

  removeEntry = subEnvUpdatable(({envsWithMeta, entryKey})=>{
    return R.mapObjIndexed(R.dissoc(entryKey), envsWithMeta)
  }),

  updateEntryVal = subEnvUpdatable(({envsWithMeta, entryKey, environment, update})=>{
    return R.assocPath([environment, entryKey], update, envsWithMeta)
  }),

  addSubEnv = ({envsWithMeta, environment, name})=>{
    const
      subEnv = {"@@__name__": name},
      id = uuid(),
      path = [environment, "@@__sub__", id]

    return R.assocPath(path, subEnv, envsWithMeta)
  },

  removeSubEnv = ({envsWithMeta, environment, id})=>{
    return R.dissocPath([environment, "@__sub__", id], envsWithMeta)
  },

  renameSubEnv = ({envsWithMeta, environment, id, name})=>{
    const path = [environment, "@@__sub__", id, "@@__name__"]
    return R.assocPath(path, name, envsWithMeta)
  },

  transformEnv = (envsWithMeta, {type, payload})=> {
    const updateEnvFn = {
            [CREATE_ENTRY]: createEntry,
            [UPDATE_ENTRY]: updateEntry,
            [REMOVE_ENTRY]: removeEntry,
            [UPDATE_ENTRY_VAL]: updateEntryVal,
            [ADD_SUB_ENV]: addSubEnv,
            [REMOVE_SUB_ENV]: removeSubEnv,
            [RENAME_SUB_ENV]: renameSubEnv
          }[type]

    return R.pipe(
      updateEnvFn,
      withProductionMetaOnly,
      withLockedProduction
    )({envsWithMeta, ...payload})
  }



