import R from 'ramda'

export const flattenObj = obj => {
  const go = obj_ => R.chain(([k, v]) => {
    if (typeof v == 'object') {
      return R.map(([k_, v_]) => [`${k}.${k_}`, v_], go(v))
    } else {
      return [[k, v]]
    }
  }, R.toPairs(obj_))

  return R.fromPairs(go(obj))
}
