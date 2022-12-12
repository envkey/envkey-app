import R from 'ramda'

import * as env from './env_middleware'
import * as fetchCurrentUser from './fetch_current_user_middleware'
import * as auth from './auth_middleware'
//import * as sessionLog from './session_log_middleware'

export default R.pipe(
  R.map(R.values),
  R.flatten
)([
  env,
  fetchCurrentUser,
  auth,
  //sessionLog
])

