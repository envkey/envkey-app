import R from 'ramda'

export const

  /*
  To avoid transmitting sensitive data, sockets communicate environment
  editing status using indices. These function convert back and forth between
  indices / entry keys and environments.
  */

  deanonymizeEnvStatus = (
    status,
    entries,
    environments
  )=> {
    const visibleEnvironments = R.without(["productionMetaOnly"], environments),
          indexToEntry = i => entries[i],
          indexToEnvironment = i => visibleEnvironments[i]

    return R.map(R.evolve({

      removingEntry: R.map(indexToEntry),

      editingEntry: R.map(indexToEntry),

      editingEntryVal: R.map(R.pipe(
        R.over(R.lensIndex(0), indexToEntry),
        R.over(R.lensIndex(1), indexToEnvironment)
      )),

      addingEntry: R.identity

    }))(status)
  },

  anonymizeEnvStatus = (
    status,
    entries,
    environments
  )=>{
    const visibleEnvironments = R.without(["productionMetaOnly"], environments),
          indexByEntry = R.invertObj(entries),
          indexByEnvironment = R.invertObj(visibleEnvironments),
          entryToIndex = entry => parseInt(indexByEntry[entry]),
          environmentToIndex = environment => parseInt(indexByEnvironment[environment])

    return R.map(R.evolve({

      removingEntry: R.map(entryToIndex),

      editingEntry: R.map(entryToIndex),

      editingEntryVal: R.map(R.pipe(
        R.over(R.lensIndex(0), entryToIndex),
        R.over(R.lensIndex(1), environmentToIndex)
      )),

      addingEntry: R.identity

    }))(status)
  },

  statusKeysToArrays = R.evolve({
    removingEntry: R.keys,

    editingEntry: R.keys,

    editingEntryVal: R.pipe(
      R.mapObjIndexed((v,k)=> R.pipe(
        R.keys,
        R.map(k2 => [k,k2])
      )(v)),
      R.values,
      R.unnest
    ),

    addingEntry: R.identity
  })