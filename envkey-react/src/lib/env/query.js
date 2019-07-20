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
    // R.filter(R.complement(R.prop("@@__hidden__"))),
    allKeys,
    R.filter(k => k.indexOf("@@__") != 0)
  )),

  subEnvEntries = (envsWithMeta, subEnvId)=> allEntries({
    [subEnvId]: findSubEnv(subEnvId, envsWithMeta)
  }),

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

  serverSubEnvOptsByRole = defaultMemoize(envsWithMeta => {
    return R.pipe(
      R.map(role => ({
        [role]: R.sortBy(
          R.pipe(R.prop('name'), R.toLower),
          allSubEnvsSorted(R.pick([role], (envsWithMeta || {}))).map(
            subEnvId => {
              const {"@@__name__": name} = findSubEnv(subEnvId, envsWithMeta)
              return {name, id: subEnvId}
            }
          )
        )
      })),
      R.mergeAll
    )(["development", "staging", "production"])
  }),

  hasAnyVal = defaultMemoize(R.pipe(
    R.values,
    R.map(R.values),
    R.flatten,
    R.filter(R.identity),
    R.any(R.prop('val'))
  )),

  subEnvPath = (subEnvId, envsWithMeta)=>{
    for (let environment in envsWithMeta){
      let path = [environment, "@@__sub__", subEnvId]
      if (R.path(path, envsWithMeta)){
        return path
      }
    }
    return []
  },

  findSubEnv = (subEnvId, envsWithMeta)=>{
    const path = subEnvPath(subEnvId, envsWithMeta)
    return R.isEmpty(path) ? null : R.path(path, envsWithMeta)
  }













