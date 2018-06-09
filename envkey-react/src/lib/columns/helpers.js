import R from 'ramda'

export const getColumnsFlattened = R.pipe(
  R.map(
    R.pipe(
      R.prop('groups'),
      R.values
    )
  ),

  R.flatten
)