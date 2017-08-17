import db from 'lib/db'
import { defaultMemoize } from 'reselect'
import R from 'ramda'
import pluralize from 'pluralize'
import { orgRoleGroupLabel } from 'lib/ui'
import moment from 'moment'

db.init("apps", "users", "appUsers", "orgUsers", "servers", "localKeys")

export const
  // User selectors
  getUser = db.users.find(),

  getUsers = db.users.list(),

  getUsersById = db.users.index(),

  getUserBySlug = db.users.findBy("slug"),

  getUserGroupsByRole = db.users.group("role", {
    sortBy: "lastName"
  }),

  getNonOrgAdminUsers = db.users.whereNotIn(
    "role",
    ["org_owner", "org_admin"],
    {sortBy: "lastName"}
  ),

  getUserGroupsByRoleForApp = db.apps.hasAndBelongsToMany("users", {
    groupBy: ({relation}) => relation.role,
    sortBy: "lastName"
  }),

  getUsersForApp = db.apps.hasAndBelongsToMany("users"),

  getUserWithOrgUserBySlug = (slug, state)=> {
    const user = getUserBySlug(slug, state),
          orgUser = getOrgUserForUser(user.id, state)

    return R.assoc("orgUser", orgUser, user)
  },

  // App selectors
  getApp = db.apps.find(),

  getApps = db.apps.list({sortBy: "name"}),

  getAppsSortedByUpdatedAt = db.apps.list({
    sortBy: ({updatedAt})=> moment(updatedAt).valueOf(),
    reverse: true
  }),

  getAppBySlug = db.apps.findBy("slug"),

  getAppGroupsForUser = db.users.hasAndBelongsToMany("apps", {
    through: "appUsers",
    groupBy: ({relation}) => relation.role,
    sortBy: "name"
  }),

  getAppsForUser = db.users.hasAndBelongsToMany("apps", {
    through: "appUsers"
  }),

  getOnboardAppId = db.path("onboardAppId"),

  // App user selectors
  getAppUsers = db.appUsers.list(),

  getAppUserBy = ({userId, appId}, state)=>{
    const fn = db.appUsers.where({appId, userId})
    return state ? fn(state)[0] : R.pipe(fn, R.head)
  },

  getAppUser = db.appUsers.find(),

  // Server selectors
  getServer = db.servers.find(),

  getServers = db.servers.list(),

  getServersForApp = db.apps.hasMany("servers"),

  getServersWithPubkeyForApp = db.apps.hasMany("servers", {
    where: {pubkey: R.complement(R.isNil)}
  }),

  getServerGroupsForApp = db.apps.hasMany("servers", {
    groupBy: "role",
    sortBy: "createdAt"
  }),

  // Local key selectors
  getLocalKey = db.localKeys.find(),

  getLocalKeys = db.localKeys.list(),

  getLocalKeysForAppUsers = db.appUsers.hasMany("localKeys"),

  getLocalKeysWithPubkeyForApp = db.apps.hasMany("localKeys", {
    where: {pubkey: R.complement(R.isNil)}
  }),

  // Org user selectors
  getOrgUserForUser = db.orgUsers.findBy("userId"),

  // Generic object selectors
  getSelectedObjectType = db.path("selectedObjectType"),

  getObject = R.curry((type, id, state)=>{
    return db(pluralize(type)).find()(id, state)
  }),

  getSelectedObjectId = db.path("selectedObjectId"),

  getSelectedObject = state => {
    const type = getSelectedObjectType(state),
          id = getSelectedObjectId(state)
    return getObject(type, id, state)
  },

  dissocRelations = R.map(R.dissoc("relation"))








