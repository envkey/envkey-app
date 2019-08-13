import R from 'ramda'
import { findSubEnv } from './transform'

export const
  inheritedShallow = ({entryKey, inherits, envsWithMeta})=> envsWithMeta[inherits][entryKey],

  inheritedDeep = ({entryKey, inherits, envsWithMeta})=>{
    let inherited = inheritedShallow({entryKey, inherits, envsWithMeta})
    while (true){
      if(inherited.inherits){
        inherited = inheritedShallow({entryKey, envsWithMeta, inherits: inherited.inherits})
      } else {
        return inherited
      }
    }
  },

  inheritedVal = props=> inheritedDeep(props).val,

  inheritedEnvironmentDeep = ({entryKey, inherits, envsWithMeta})=>{
    let lastInherited = inherits,
        inherited = inheritedShallow({entryKey, inherits, envsWithMeta})

    while (true){
      if(inherited.inherits){
        lastInherited = inherited.inherits
        inherited = inheritedShallow({entryKey, envsWithMeta, inherits: inherited.inherits})
      } else {
        return lastInherited
      }
    }
  },

  inheritingEnvironments = ({environment, entryKey, envsWithMeta})=>{
    return ["development", "staging", "production"].filter(checkEnvironment => {
      if (checkEnvironment == environment) return false
      const cell = R.path([checkEnvironment, entryKey], envsWithMeta)
      if (cell && cell.inherits){
        return inheritedEnvironmentDeep({entryKey, envsWithMeta, inherits: cell.inherits}) == environment
      }
      return false
    })
  },

  productionInheritanceOverrides = (envsWithMeta, subEnvId) => R.pipe(
    R.propOr({}, "production"),

    R.filter((envsWithMetaCell)=> envsWithMetaCell && envsWithMetaCell.inherits && envsWithMetaCell.locked),

    R.mapObjIndexed(({inherits}, entryKey)=> {
      const metaSubEnv = R.path([
        "productionMetaOnly",
        "@@__sub__",
        subEnvId
      ], envsWithMeta)

      if (metaSubEnv &&
          metaSubEnv[entryKey] &&
          metaSubEnv[entryKey].hasVal){
        return undefined
      }

      return inheritedVal({inherits, entryKey, envsWithMeta})
    }),


    R.filter(Boolean)

  )(envsWithMeta)