import R from 'ramda'

export const

  isOutdatedEnvsResponse = R.pathEq(["payload", "response", "data", "error"], "envs_outdated"),

  isTimeout = action => R.path(["payload", "message"], action) && Boolean(action.payload.message.match(/timeout .+? exceeded/))