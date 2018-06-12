import R from 'ramda'
import * as coreMiddlewares from 'envkey-client-core/dist/middleware'
import * as env from './env_middleware'

export default [
  ...coreMiddlewares,
  ...R.values(env)
]
