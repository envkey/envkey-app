import R from 'ramda'
import * as coreMiddleware from 'envkey-client-core/dist/middleware'
import * as envMiddleware from './env_middleware'
import * as apiMiddleware from './api_middleware'

export default R.pipe(
  R.map(R.values),
  R.flatten
)([
  coreMiddleware,
  envMiddleware,
  apiMiddleware
])