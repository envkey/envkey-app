import R from 'ramda'

const
  statusKeyToArray = R.pipe(
    R.mapObjIndexed((v,k)=> R.pipe(
      R.keys,
      R.map(k2 => [k,k2])
    )(v)),
    R.values,
    R.unnest
  )

export const

  /*
  To avoid transmitting sensitive data, sockets communicate environment
  editing status using indices. These function convert back and forth between
  indices / entry keys and environments.
  */

  deanonymizeEnvStatus = (
    status,
    entries,
    environments,
    subEnvs
  )=> {
    const visibleEnvironments = R.without(["productionMetaOnly"], environments),
          indexToEntry = i => entries[i],
          indexToEnvironment = i => visibleEnvironments[i],
          indexToSubEnv = i => subEnvs[i] || "@@__base__"

    return R.map(R.evolve({

      removingEntry: R.map(R.pipe(
        R.over(R.lensIndex(0), indexToEntry),
        R.over(R.lensIndex(1), indexToSubEnv)
      )),

      editingEntry: R.map(R.pipe(
        R.over(R.lensIndex(0), indexToEntry),
        R.over(R.lensIndex(1), indexToSubEnv)
      )),

      editingEntryVal: R.map(R.pipe(
        R.over(R.lensIndex(0), indexToEntry),
        R.over(R.lensIndex(1), indexToEnvironment)
      )),

      addingEntry: R.map(indexToSubEnv)

    }))(status)
  },

  anonymizeEnvStatus = (
    status,
    entries,
    environments,
    subEnvs
  )=>{
    const visibleEnvironments = R.without(["productionMetaOnly"], environments),
          indexByEntry = R.invertObj(entries),
          indexByEnvironment = R.invertObj(visibleEnvironments),
          indexBySubEnvs = R.invertObj(subEnvs),
          entryToIndex = entry => parseInt(indexByEntry[entry]),
          environmentToIndex = environment => parseInt(indexByEnvironment[environment]),
          subEnvToIndex = subEnv => parseInt(indexBySubEnvs[subEnv] || -1)

    return R.map(R.evolve({

      removingEntry: R.map(R.pipe(
        R.over(R.lensIndex(0), entryToIndex),
        R.over(R.lensIndex(1), subEnvToIndex)
      )),

      editingEntry: R.map(R.pipe(
        R.over(R.lensIndex(0), entryToIndex),
        R.over(R.lensIndex(1), subEnvToIndex)
      )),

      editingEntryVal: R.map(R.pipe(
        R.over(R.lensIndex(0), entryToIndex),
        R.over(R.lensIndex(1), environmentToIndex)
      )),

      addingEntry: R.map(subEnvToIndex)

    }))(status)
  },

  statusKeysToArrays = R.evolve({
    removingEntry: statusKeyToArray,
    editingEntry: statusKeyToArray,
    editingEntryVal: statusKeyToArray,
    addingEntry: R.of
  })