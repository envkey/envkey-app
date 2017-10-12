import R from 'ramda'
import { defaultMemoize } from 'reselect'

export const

  allKeys = defaultMemoize(R.pipe(
    R.values,
    R.map(R.keys),
    R.flatten,
    R.uniq,
    R.sort(R.ascend(R.identity))
  )),

  allEntries = defaultMemoize(R.pipe(
    allKeys,
    R.filter(k => k.indexOf("@@__") != 0)
  )),

  allSubEnvsSorted = defaultMemoize(R.pipe(
    R.values,
    R.map(R.pipe(
      R.propOr({},"@@__sub__"),
      R.keys
    )),
    R.flatten,
    R.uniq,
    R.sort(R.ascend(R.identity))
  )),

  allEntriesWithSubEnvs = defaultMemoize(envsWithMeta => {
    return R.pipe(
      allSubEnvsSorted,
      R.pipe(
        R.map(subEnvId => (findSubEnv(subEnvId, envsWithMeta))),
        allEntries
      ),
      R.flatten,
      R.concat(allEntries(envsWithMeta)),
      R.sort(R.ascend(R.identity))
    )(envsWithMeta)
  }),

  hasAnyVal = defaultMemoize(R.pipe(
    R.values,
    R.map(R.values),
    R.flatten,
    R.any(R.prop('val'))
  )),

  subEnvPath = (subEnvId, envsWithMeta)=>{
    for (let environment in envsWithMeta){
      let path = [environment, "@@__sub__", subEnvId]
      if (R.path(path, envsWithMeta)){
        return path
      }
    }
    return null
  },

  findSubEnv = (subEnvId, envsWithMeta)=>{
    return R.path(subEnvPath(subEnvId, envsWithMeta), envsWithMeta)
  }












