import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import pluralize from 'pluralize'
import {
  UserRowDisplay,
  AppRowDisplay,
  ServerRowDisplay,
  LocalKeyRowDisplay
} from 'components/assoc_manager'
import {
  AppForm,
  ServerForm,
  UserForm,
  LocalKeyForm
} from 'components/forms'
import { appRoleGroupLabel } from 'lib/ui'
import {
  getUserGroupsByRoleForApp,
  getServerGroupsForApp,
  getAppGroupsForUser,
  getNonOrgAdminUsers,
  getApps,
  getIsAddingAssoc,
  getIsCreating,
  getUsersForApp,
  getAppsForUser,
  getOrgRolesInvitable,
  getCurrentUserLocalKeysForApp,
  dissocRelations
} from 'selectors'

const adminUserPermissions = [
        h.span(["Can view + edit all environments."]),
        h.span(["Can manage user access + server access for all environments."]),
        h.span(["Can invite collaborators + edit app settings."])
      ],
      productionUserPermissions = [
        h.span(["Can view + edit all environments."]),
        h.span(["Can manage server access for all environments."])
      ],
      developmentUserPermissions = [
        h.span(["Can view + edit development and staging environments."])
      ]

export default function({
  parentType,
  assocType,
  parent,
  state
}){
  switch([parentType, assocType].join("-")){
    case "app-user":
      const userGroups = getUserGroupsByRoleForApp(parent.id, state),
            nonOrgAdminUsers = getNonOrgAdminUsers(state),
            connectedUsersWithoutRelations = dissocRelations(getUsersForApp(parent.id, state)),
            candidates = R.without(connectedUsersWithoutRelations, nonOrgAdminUsers)

      return {
        rowDisplayType: UserRowDisplay,
        addFormType: UserForm,
        addLabel: "+",
        addExistingLabel: "Add Existing Users",
        addExistingSubmitLabelFn: (n)=> "Add Users",
        addNewLabel: "Invite New User",
        addExistingTextFn: ({firstName, lastName}) => [firstName, lastName].join(" "),
        addExistingLabelFn: ({firstName, lastName}) => h.span([h.span([firstName, " "]), h.strong(lastName)]),
        columns: [
          {
            title: "Admin",
            subtitle: "Access",
            role: "admin",
            groups: R.pick(["org_owner", "org_admin", "admin"], userGroups),
            sectionLabelFn: appRoleGroupLabel,
            permissionCopyLines: adminUserPermissions,
            keyLabel: "development",
            orgRolesInvitable: getOrgRolesInvitable(state),
            isAddingAssoc: (getIsAddingAssoc({assocType, parentId: parent.id, role: "admin"}, state) ||
                            getIsAddingAssoc({assocType, parentId: parent.id, role: "org_admin"}, state)),
            isCreating: (getIsCreating({assocType, parentId: parent.id, role: "admin"}, state) ||
                         getIsCreating({assocType, parentId: parent.id, role: "org_admin"}, state)),
            candidates
          },
          {
            title: "Devops",
            subtitle: "Access",
            role: "production",
            groups: R.pick(["production"], userGroups),
            permissionCopyLines: productionUserPermissions,
            keyLabel: "development",
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "production"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "production"}, state),
            candidates
          },
          {
            title: "Developer",
            subtitle: "Access",
            role: "development",
            groups: R.pick(["development"], userGroups),
            permissionCopyLines: developmentUserPermissions,
            keyLabel: "development",
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "development"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "development"}, state),
            candidates
          }
        ]
      }

    case "app-server":
      const serverGroups = getServerGroupsForApp(parent.id, state)
      return {
        rowDisplayType: ServerRowDisplay,
        addFormType: ServerForm,
        addLabel: "+",

        columns: [
          {
            title: "Test",
            subtitle: "Server Keys",
            role: "development",
            groups: R.pick(["development"], serverGroups),
            keyLabel: "development",
            permissionCopyLines: [h.span(["Connects to the ", h.strong("development"), " environment."])],
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "development"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "development"}, state)
          },
          {
            title: "Staging",
            subtitle: "Server Keys",
            role: "staging",
            groups: R.pick(["staging"], serverGroups),
            keyLabel: "staging",
            permissionCopyLines: [h.span(["Connects to the ", h.strong("staging"), " environment."])],
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "staging"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "staging"}, state)
          },
          {
            title: "Production",
            subtitle: "Server Keys",
            role: "production",
            groups: R.pick(["production"], serverGroups),
            keyLabel: "production",
            permissionCopyLines: [h.span(["Connects to the ", h.strong("production"), " environment."])],
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "production"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "production"}, state)
          }
        ]
      }

    case "app-localKey":
      return {
        rowDisplayType: LocalKeyRowDisplay,
        addFormType: LocalKeyForm,
        addLabel: "+",

        columns: [
          {
            // title: "Local Development",
            // subtitle: "Keys",
            role: "development",
            groups: {development: getCurrentUserLocalKeysForApp(parent.id, state)},
            keyLabel: "development",
            // permissionCopyLines: [h.span(["Connects to the ", h.strong("development"), " environment."])],
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "development"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "development"}, state),
            isCurrentUser: true
          }
        ]
      }

    case "user-app":
      const appGroups = getAppGroupsForUser(parent.id, state),
            appGroupsWithoutRelations = R.mapObjIndexed(dissocRelations, appGroups),
            orgAdminRoles = ["org_owner", "org_admin"],
            orgAdminApps = R.pipe( R.pick(orgAdminRoles),
                                     R.values,
                                     R.flatten)(appGroups),
            appAdminRoles = orgAdminRoles.concat(["admin"]),
            connectedAppsWithoutRelations = dissocRelations(getAppsForUser(parent.id, state)),
            appCandidates = R.without(connectedAppsWithoutRelations, getApps(state))

      let columns = [{
        title: "Admin",
        subtitle: "Access",
        role: "admin",
        groups: R.pick(appAdminRoles, appGroups),
        sectionLabelFn: appRoleGroupLabel,
        permissionCopyLines: adminUserPermissions,
        keyLabel: "development",
        isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "admin"}, state),
        isCreating: getIsCreating({assocType, parentId: parent.id, role: "admin"}, state),
        candidates: appCandidates
      }]

      if(!["org_owner", "org_admin"].includes(parent.role)){
        columns = columns.concat([
          {
            title: "Devops",
            subtitle: "Access",
            role: "production",
            groups: R.pick(["production"], appGroups),
            permissionCopyLines: productionUserPermissions,
            keyLabel: "development",
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "production"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "production"}, state),
            candidates: appCandidates
          },
          {
            title: "Developer",
            subtitle: "Access",
            role: "development",
            groups: R.pick(["development"], appGroups),
            permissionCopyLines: developmentUserPermissions,
            keyLabel: "development",
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "development"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "development"}, state),
            candidates: appCandidates
          }
        ])
      }

      return {
        rowDisplayType: AppRowDisplay,
        addLabel: "+",
        addExistingSubmitLabelFn: (n)=> "Add Apps",
        addExistingTextFn: R.prop("name"),
        parentNameFn: ({firstName, lastName})=> [firstName, lastName].join(" "),
        columns
      }

    default:
      throw new Error("Column config not found")
  }
}