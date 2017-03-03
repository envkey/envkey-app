import db from 'lib/db'
import { defaultMemoize } from 'reselect'
import R from 'ramda'
import { orgRoleGroupLabel } from 'lib/ui'

db.init("apps", "services", "users", "appUsers", "servers", "appServices")

export const

  getApps = db.apps.list({sortBy: "name"}),

  getServerGroupsForApp = db.apps.hasMany("servers", {
    groupBy: "role",
    sortBy: "name"
  }),

  getAppUserBy = ({userId, appId}, state)=>{
    const fn = db.appUsers.where({appId, userId})
    return state ? fn(state)[0] : R.pipe(fn, R.head)
  },

  getAppUser = db.appUsers.find(),

  getUsersForApp = db.apps.hasAndBelongsToMany("users"),

  getApp = db.apps.find(),

  getAppBySlug = db.apps.findBy("slug"),

  getService = db.services.find(),

  getServiceBySlug = db.services.findBy("slug"),

  getUser = db.users.find(),

  getUserBySlug = db.users.findBy("slug"),

  getServices = db.services.list({sortBy: "name"}),

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

  getServicesForApp = db.apps.hasAndBelongsToMany("services", {sortBy: "name"}),

  getAppServiceBy = ({appId, serviceId}, state)=>{
    const fn = db.appServices.where({appId, serviceId})
    return state ? fn(state)[0] : R.pipe(fn, R.head)
  },

  getKeyableServersForApp = db.apps.hasMany("servers", {
    where: {pubkey: R.complement(R.isNil)}
  }),

  getAppsForService = db.services.hasAndBelongsToMany("apps", {
    through: "appServices",
    sortBy: "name"
  }),

  getAppGroupsForUser = db.users.hasAndBelongsToMany("apps", {
    through: "appUsers",
    groupBy: ({relation}) => relation.role,
    sortBy: "name"
  }),

  getAppsForUser = db.users.hasAndBelongsToMany("apps", {
    through: "appUsers"
  }),

  getServer = db.servers.find(),

  dissocRelations = R.map(R.dissoc("relation")),

  getUsersForService = (serviceId, state)=>{
    if(!state)return R.partial(getUsersForService, [serviceId])

    const apps = getAppsForService(serviceId, state),
          serviceAdmins = R.pipe(
            getUserGroupsByRole,
            R.pick(["service_admin", "org_admin", "org_owner"]),
            R.values,
            R.flatten
          )(state)

    return R.pipe(
            R.map(({id})=> getUsersForApp(id, state)),
            R.flatten,
            R.concat(serviceAdmins),
            R.uniq
          )(apps)
  }








