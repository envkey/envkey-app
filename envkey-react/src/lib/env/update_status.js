import R from 'ramda'

export const

  /*
  To avoid transmitting sensitive data, sockets communicate environment
  editing status using indices. This function converts the indices back
  to entry keys and environments so they're easier to work with and don't
  get out of sync after local updates.
  */

  processSocketUpdateEnvStatus = (
    status,
    entries,
    environments
  )=> {
    const indexToEntry = i => entries[i],
          indexToEnvironment = i => environments[i],
          res = {
            userId: status.userId,
            ...R.pick(["addingEntry"], status)
          }

    for (let k of ["removingEntry", "editingEntry"]){
      let val = status[k]
      if (val === false){
        res[k] = false
      } else if (val){
        res[k] = indexToEntry(val)
      }
    }

    if (status.editingEntryVal === false){
      res.editingEntryVal = false
    } else if (status.editingEntryVal){
      const [entryIndex, envIndex] = status.editingEntryVal
      res.editingEntryVal = [indexToEntry(entryIndex), indexToEnvironment(envIndex)]
    }

    if (status.addingEntry === true){
      res.addingEntry = true
    } else if (status.addingEntry === false){
      res.addingEntry = false
    }

    return res
  }