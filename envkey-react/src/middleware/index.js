import R from 'ramda'

import * as env from './env_middleware'

export default [
  ...R.values(env)
]

