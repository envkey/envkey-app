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

  getUsers = db.users.where({deleted: R.not}),

  getActiveUsers = R.pipe(
    getUsers,
    R.filter(({role, inviteAcceptedAt})=> inviteAcceptedAt || role == "org_owner")
  ),

  getUsersWithDeleted = db.users.list(),

  getUsersById = db.users.index(),

  getUserBySlug = db.users.findBy("slug"),

  getUserByEmail = db.users.findBy("email"),

  getUserGroupsByRole = db.users.group("role", {
    sortBy: "lastName",
    where: {deleted: R.not}
  }),

  getOrgOwner = R.pipe(
    getUserGroupsByRole,
    R.prop("org_owner"),
    R.head
  ),

  getNonOrgAdminUsers = db.users.where(
    {deleted: R.not, role: r => !(["org_owner", "org_admin"].includes(r))},
    {sortBy: "lastName"}
  ),

  getUserGroupsByRoleForApp = db.apps.hasAndBelongsToMany("users", {
    groupBy: ({relation}) => relation.role,
    sortBy: "lastName",
    where: {deleted: R.not}
  }),

  getUsersForApp = db.apps.hasAndBelongsToMany("users", {where: {deleted: R.not}}),

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

  getServerGroupsForApp = R.pipe(
    db.apps.hasMany("servers", {
      groupBy: "role",
      sortBy: "createdAt"
    }),
    R.map(R.groupBy(R.prop("subEnvId")))
  ),

  getServersForSubEnv = R.curry((appId, subEnvId, state)=>{
    const servers = getServersForApp(appId, state)
    return servers.filter(R.propEq("subEnvId", subEnvId))
  }),

  getMostServersPerEnvironment = R.pipe(
    db.servers.group("appId"),
    R.values,
    R.map(R.pipe(
      R.groupBy(R.prop("role")),
      R.values,
      R.map(R.length),
      R.apply(Math.max)
    )),
    R.apply(Math.max)
  ),

  // Local key selectors
  getLocalKey = db.localKeys.find(),

  getLocalKeys = db.localKeys.list(),

  getLocalKeysForAppUser = db.appUsers.hasMany("localKeys", {
    sortBy: "createdAt"
  }),

  getLocalKeysWithPubkeyForApp = db.apps.hasMany("localKeys", {
    where: {pubkey: R.complement(R.isNil)}
  }),

  getMostLocalKeysPerAppUser = R.pipe(
    db.localKeys.group("appUserId"),
    R.values,
    R.map(R.length),
    R.apply(Math.max)
  ),

  // EnvKey (Servers / LocalKeys) selectors
  getMostEnvKeysPerEnvironment = state => {
    return Math.max(
      getMostServersPerEnvironment(state),
      getMostLocalKeysPerAppUser(state)
    )
  },

  // Org user selectors
  getOrgUserForUser = db.orgUsers.findBy("userId"),

  getOrgUsers = db.orgUsers.list(),

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








