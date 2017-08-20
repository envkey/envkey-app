import R from 'ramda'

import * as env from './env_middleware'
import * as fetchCurrentUser from './fetch_current_user_middleware'

export default [
  ...R.values(env),
  ...R.values(fetchCurrentUser)
]

