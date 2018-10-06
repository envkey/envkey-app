import R from 'ramda'
import db from "envkey-client-core/dist/lib/db"
import {
  getApps,
  getCurrentUser,
  getCurrentOrg,
  getActiveUsers,
  getObject,
  getEnvUpdateId
} from 'envkey-client-core/dist/selectors'

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

  getSelectedObjectType = db.path("selectedObjectType"),

  getSelectedObjectId = db.path("selectedObjectId"),

  getSelectedObject = state => {
    const type = getSelectedObjectType(state),
          id = getSelectedObjectId(state)
    return getObject(type, id, state)
  },

  getSelectedParentEnvUpdateId = state =>{
    return getEnvUpdateId(getSelectedObjectId(state), state)
  },

  getVersionFilters = db.path("versionFilters")







