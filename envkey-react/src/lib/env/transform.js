import R from 'ramda'
import {inheritedVal} from './inheritance'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL
} from 'actions'

const
  getMetaToValFn = (envsWithMeta)=> (meta, entryKey)=>{
    if (meta.inherits){
      return inheritedVal({entryKey, envsWithMeta, inherits: meta.inherits})
    } else if (meta.val || meta.val === ""){
      return meta.val
    } else if (meta.val === ""){
      return undefined
    }
  }

export const
  rawEnv = ({envsWithMeta, environment})=> {
    return R.mapObjIndexed(
      getMetaToValFn(envsWithMeta),
      envsWithMeta[environment]
    )
  },

  createEntry = ({envsWithMeta, entryKey, vals})=>{
    return R.mapObjIndexed(
      (env, name) => R.assoc(entryKey, vals[name], env),
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

    return updateEnvFn({envsWithMeta, ...payload})
  }



