import R from 'ramda'

export const

  isOutdatedEnvsResponse = R.pathEq(["payload", "response", "data", "error"], "envs_outdated")