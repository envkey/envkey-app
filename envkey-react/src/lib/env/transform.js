import R from 'ramda'
import {inheritedVal} from './inheritance'

const
  getMetaToValFn = (envsWithMeta)=> (meta, entryKey)=>{
    return meta.inherits ?
      inheritedVal({entryKey, envsWithMeta, inherits: meta.inherits}) :
      (meta.val || undefined)
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
  }



