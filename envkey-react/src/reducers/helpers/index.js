import R from 'ramda'

export const

  indexById = objects => R.indexBy(R.prop("id"), objects)