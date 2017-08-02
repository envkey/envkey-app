import R from 'ramda'

export const

  allKeys = R.pipe(
    R.values,
    R.map(R.keys),
    R.flatten,
    R.uniq,
    R.sort(R.ascend(R.identity))
  )





