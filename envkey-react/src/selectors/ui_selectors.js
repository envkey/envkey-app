import R from 'ramda'
import db from 'lib/db'
import {
  getApps,
  getCurrentUser,
  getCurrentOrg,
  getActiveUsers
} from 'envkey-client-core/selectors'

export const
  getAppLoaded = db.path("appLoaded"),

  getDisconnected = db.path("disconnected"),

  getCurrentRoute = db.path("routing", "locationBeforeTransitions"),

  getIsInvitee = db.path("isInvitee"),

  getIsOnboarding = (state)=> getApps(state).length == 1 || getIsInvitee(state),

  getIsDemo = R.anyPass([
    db.path("isDemo"),
    R.pipe(getCurrentUser, R.path(['demo'])),
    R.pipe(getCurrentOrg, R.path(['demo']))
  ]),

  getDemoDownloadUrl = db.path("demoDownloadUrl"),

  getStripeFormOpened = db.path("stripeFormOpened"),

  getIsExceedingFreeTier = state => {
    const currentOrg = getCurrentOrg(state)
    if (!currentOrg || !currentOrg.freePlan)return false

    const {maxUsers, maxApps, maxKeysPerEnv} = currentOrg.freePlan

    return getApps(state).length > maxApps ||
           getActiveUsers(state).length > maxUsers // ||
           // getMostEnvKeysPerEnvironment(state) > maxKeysPerEnv
  }






