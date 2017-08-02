import R from 'ramda'
import {inheritedVal} from './inheritance'
import {allKeys} from './query'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL
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
    const keys = allKeys(envsWithMeta),
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
            keys
          )

    return {...envsWithMeta, production: R.mergeAll(prodVals)}
  },

  withMissingKeys = envsWithMeta => {
    const keys = allKeys(envsWithMeta),
          withMissing = R.map(env => R.mergeAll(
            R.map(
              key => ({[key]: (env[key] || {val: null, inherits: null})}),
              keys
            )
          ))(R.omit(["productionMetaOnly"], envsWithMeta))

    return {
      ...envsWithMeta,
      ...withMissing
    }
  }

export const
  normalizeEnvsWithMeta = R.pipe(
    // R.omit(["productionMetaOnly"]),

    withMissingKeys,

    withLockedProduction

  ),

  rawEnv = ({envsWithMeta, environment})=> {
    return R.mapObjIndexed(
      getMetaToValFn(envsWithMeta),
      envsWithMeta[environment]
    )
  },

  createEntry = ({envsWithMeta, entryKey, vals})=>{
    return R.mapObjIndexed(
      (env, name) => vals[name] ? R.assoc(entryKey, vals[name], env) : env,
      envsWithMeta
    )
  },

  updateEntry = ({envsWithMeta, entryKey, newKey})=>{
    return R.mapObjIndexed(
      (env)=> ({...R.dissoc(entryKey, env), [newKey]: env[entryKey]}),
      envsWithMeta
    )
  },

  removeEntry = ({envsWithMeta, entryKey})=>{
    return R.mapObjIndexed(R.dissoc(entryKey), envsWithMeta)
  },

  updateEntryVal = ({envsWithMeta, entryKey, environment, update})=>{
    return R.assocPath([environment, entryKey], update, envsWithMeta)
  },

  transformEnv = (envsWithMeta, {type, payload})=> {
    const updateEnvFn = {
            [CREATE_ENTRY]: createEntry,
            [UPDATE_ENTRY]: updateEntry,
            [REMOVE_ENTRY]: removeEntry,
            [UPDATE_ENTRY_VAL]: updateEntryVal
          }[type]

    return R.pipe(
      updateEnvFn,
      withProductionMetaOnly,
      withLockedProduction
    )({envsWithMeta, ...payload})
  }



