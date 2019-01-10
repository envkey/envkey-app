import R from 'ramda'
import {inheritedVal, inheritingEnvironments} from './inheritance'
import {allKeys, allEntries, subEnvPath, findSubEnv, allEntriesWithSubEnvs} from './query'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,
  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
  RENAME_SUB_ENV
} from 'actions'
import diff from 'deep-diff'

const
  isEntry = (v, k)=> k.indexOf("@@__") != 0,

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

  prodValToProdMetaOnlyValFn = (envsWithMeta, keyPath=[]) => (entryVal, entryKey)=>{
    if (entryKey.indexOf("@@__") == 0)return entryVal
    if(!entryVal || entryVal.locked){
      return R.path(["productionMetaOnly"].concat(keyPath).concat(entryKey), envsWithMeta)
    }
    const {val, inherits} = entryVal
    return {
      inherits,
      hasVal: Boolean(val),
      isUndefined: (!inherits && val === null),
      isEmpty: (!inherits && val === "")
    }
  },

  withProductionMetaOnly = envsWithMeta => {
    if(!envsWithMeta.production)return envsWithMeta
    return {
      ...envsWithMeta,
      productionMetaOnly: R.mapObjIndexed(
        (entryVal, entryKey)=> {
          if(entryKey == "@@__sub__"){
            const subEnvs = entryVal
            return R.mapObjIndexed(
              (subEnv, subEnvId)=> {
                const keyPath = ["@@__sub__", subEnvId],
                      prodValToProdMetaOnlyVal = prodValToProdMetaOnlyValFn(envsWithMeta, keyPath)
                return R.mapObjIndexed(prodValToProdMetaOnlyVal, subEnv)
              },
              subEnvs
            )
          } else {
            return prodValToProdMetaOnlyValFn(envsWithMeta)(entryVal, entryKey)
          }
        },
        envsWithMeta.production
      )
    }
  },

  prodKeyWithLockedProductionFn = (envsWithMeta, keyPath=[]) => key => {
    const prodPath = ["production"].concat(keyPath).concat(key),
          prodMetaPath = ["productionMetaOnly"].concat(keyPath).concat(key),
          prodVal = R.path(prodPath, envsWithMeta),
          prodMetaVal = R.path(prodMetaPath, envsWithMeta)

    if (prodVal || key.indexOf("@@__") == 0){
      return {[key]: prodVal || prodMetaVal}
    } else {
      const lockedVal = prodMetaVal ?
              productionMetaValToLockedProductionVal(prodMetaVal) :
              {val: null, inherits: null, locked: true, hasVal: !envsWithMeta.productionMetaOnly}

      return {[key]: lockedVal}
    }
  },

  withLockedProduction = envsWithMeta => {
    const keys = allKeys(envsWithMeta),
          prodVals = R.map(
            key => {
              if (key == "@@__sub__" && R.path(["productionMetaOnly", "@@__sub__"], envsWithMeta)){
                return {"@@__sub__": R.mapObjIndexed(
                  (subEnv, subEnvId)=> R.mergeAll(
                    R.map(prodKeyWithLockedProductionFn(envsWithMeta, ["@@__sub__", subEnvId]), R.keys(subEnv))
                  ),
                  envsWithMeta.productionMetaOnly["@@__sub__"]
                )}
              }

              return prodKeyWithLockedProductionFn(envsWithMeta)(key)
            },
            keys
          )

    return {...envsWithMeta, production: R.mergeAll(prodVals)}
  },

  withMissingEntries = envsWithMeta => {
    const keys = allKeys(envsWithMeta),
          withMissing = R.map(env => R.mergeAll(R.filter(R.identity,
            R.map(
              key => {
                if(key.indexOf("@@__") == 0){
                  return env[key] ? {[key]: env[key]} : null
                }
                return {[key]: (env[key] || {val: null, inherits: null})}
              },
              keys
            )
          )))(R.omit(["productionMetaOnly"], envsWithMeta))

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
  normalizeEnvsWithMeta = R.pipe(
    withMissingEntries,
    withLockedProduction
  ),

  rawEnv = ({envsWithMeta, environment, subEnvId})=> {
    const res = R.mapObjIndexed(
      getMetaToValFn(envsWithMeta),
      R.pickBy(isEntry, envsWithMeta[environment])
    )

    if (subEnvId){
      return {
        ...res,
        ...R.mapObjIndexed(
          getMetaToValFn(envsWithMeta),
          R.pickBy(isEntry, findSubEnv(subEnvId, envsWithMeta))
        )
      }
    } else {
      return res
    }
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
      (env)=> {
        if (env[entryKey]){
          return {
            ...R.dissoc(entryKey, env), [newKey]: env[entryKey]
          }
        } else {
          return env
        }
      },
      envsWithMeta
    )
  }),

  removeEntry = subEnvUpdatable(({envsWithMeta, entryKey})=>{
    return R.mapObjIndexed(R.dissoc(entryKey), envsWithMeta)
  }),

  updateEntryVal = subEnvUpdatable(({envsWithMeta, entryKey, environment, update})=>{
    const
      path = [environment, entryKey],
      existing = R.path(path, envsWithMeta)

    if (!existing){
      return envsWithMeta
    }

    let updated = R.assocPath(path, update, envsWithMeta)
    const inheriting = inheritingEnvironments({environment, entryKey, envsWithMeta})

    if (inheriting.length){
      for (let inheritingEnvironment of inheriting){
        if (update.val){
          updated = R.assocPath([inheritingEnvironment, entryKey, "inheritedVal"], update.val, updated)
        } else {
          updated = R.dissocPath([inheritingEnvironment, entryKey, "inheritedVal"], updated)
        }
      }
    }

    return updated
  }),

  addSubEnv = ({envsWithMeta, environment, name, id})=>{
    const
      subEnv = {"@@__name__": name},
      path = [environment, "@@__sub__", id]

    return R.assocPath(path, subEnv, envsWithMeta)
  },

  removeSubEnv = ({envsWithMeta, environment, id})=>{
    return R.dissocPath([environment, "@@__sub__", id], envsWithMeta)
  },

  renameSubEnv = ({envsWithMeta, environment, id, name})=>{
    const path = [environment, "@@__sub__", id, "@@__name__"]
    return R.assocPath(path, name, envsWithMeta)
  },

  clearOrphans = envsWithMeta => {
    return R.mapObjIndexed((env => {
      const toOmit = Object.keys(env).filter(k => !k || !env[k])
      return R.omit(toOmit, env)
    }), envsWithMeta)
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
      clearOrphans,
      withProductionMetaOnly,
      withLockedProduction
    )({envsWithMeta, ...payload})
  },

  envUpdateConflicts = (preUpdateEnvsWithMeta, postUpdateEnvsWithMeta, envActionsPending)=>{
    if (!envActionsPending || envActionsPending.length == 0){
      return []
    }

    const updateDiffs = diff(preUpdateEnvsWithMeta, postUpdateEnvsWithMeta),
          preUpdateWithPending = envActionsPending.reduce(transformEnv, preUpdateEnvsWithMeta),
          postUpdateWithPending = envActionsPending.reduce(transformEnv, postUpdateEnvsWithMeta),
          preUpdatePendingDiffs = diff(preUpdateEnvsWithMeta, preUpdateWithPending),
          allEntriesSet = new Set(R.concat(
            allEntriesWithSubEnvs(preUpdateEnvsWithMeta),
            allEntriesWithSubEnvs(postUpdateEnvsWithMeta),
            allEntriesWithSubEnvs(preUpdateWithPending),
            allEntriesWithSubEnvs(postUpdateWithPending)
          )),
          commonPaths = R.innerJoin(
            (p1,p2)=> R.equals(p1,p2) || R.startsWith(p1,p2) || R.startsWith(p2,p1),
            updateDiffs.map(R.prop('path')),
            preUpdatePendingDiffs.map(R.prop('path'))
          )

    return R.pipe(
      R.map(R.find(k => allEntriesSet.has(k))),
      R.uniq
    )(commonPaths)
  }



