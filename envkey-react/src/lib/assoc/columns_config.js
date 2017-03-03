import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import pluralize from 'pluralize'
import {
  UserRowDisplay,
  AppRowDisplay,
  ServerRowDisplay,
  AppServiceRowDisplay
} from 'components/assoc_manager'
import {
  AppForm,
  ServerForm,
  UserForm,
  ServiceForm
} from 'components/forms'
import { appRoleGroupLabel } from 'lib/ui'
import {
  getUserGroupsByRoleForApp,
  getServerGroupsForApp,
  getAppGroupsForUser,
  getAppsForService,
  getNonOrgAdminUsers,
  getApps,
  getServicesForApp,
  getServices,
  getIsAddingAssoc,
  getIsGeneratingAssocKey,
  getIsCreating,
  getUsersForApp,
  getAppsForUser,
  dissocRelations
} from 'selectors'

const adminUserPermissions = [
        "Can view + edit all environments.",
        "Can manage user access + server access for all environments.",
        "Can invite collaborators + edit app settings."
      ],
      productionUserPermissions = [
        "Can view + edit all environments.",
        "Can manage server access for all environments."
      ],
      developmentUserPermissions = [
        "Can view + edit development and staging environments.",
        "Can manage development and staging server access."
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
        addExistingSubmitLabelFn: (n)=> `Add ${pluralize("User", n, true)}`,
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
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "admin"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "admin"}, state),
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
            title: "Production",
            // subtitle: "Servers",
            role: "production",
            groups: R.pick(["production"], serverGroups),
            keyLabel: "production",
            permissionCopyLines: [h.span(["Connect to the ", h.strong("production"), " environment."])],
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "production"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "production"}, state)
          },
          {
            title: "Staging",
            // subtitle: "Servers",
            role: "staging",
            groups: R.pick(["staging"], serverGroups),
            keyLabel: "staging",
            permissionCopyLines: [h.span(["Connect to the ", h.strong("staging"), " environment."])],
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "staging"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "staging"}, state)
          },
          {
            title: "Development",
            // subtitle: "Servers",
            role: "development",
            groups: R.pick(["development"], serverGroups),
            keyLabel: "development",
            permissionCopyLines: [h.span(["Connect to the ", h.strong("development"), " environment."])],
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "development"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "development"}, state)
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
            title: "Production",
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
            title: "Development + Staging",
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
        addExistingSubmitLabelFn: (n)=> `Add ${pluralize("App", n, true)}`,
        addExistingTextFn: R.prop("name"),
        columns
      }

    case "service-app":
      const serviceApps = getAppsForService(parent.id, state),
            orgApps = getApps(state)
      return {
        rowDisplayType: AppRowDisplay,
        addFormType: AppForm,
        addLabel: "+",
        addExistingSubmitLabelFn: (n)=> `Add ${pluralize("App", n, true)}`,
        addExistingTextFn: R.prop("name"),
        columns: [
          {
            title: "Connected Applications",
            groups: {apps: serviceApps},
            candidates: R.without(dissocRelations(serviceApps || []))(orgApps),
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id}, state)
          }
        ]
      }

    case "app-service":
      const appServices = getServicesForApp(parent.id, state),
            orgServices = getServices(state)
      return {
        rowDisplayType: AppServiceRowDisplay,
        addFormType: ServiceForm,
        addLabel: "+",
        addExistingSubmitLabelFn: (n)=> `Add ${pluralize("Service", n, true)}`,
        addExistingTextFn: R.prop("name"),
        addExistingLabel: "Connect Existing Services",
        addNewLabel: "Create New Service",
        columns: [
          {
            title: "Connected Services",
            groups: {services: appServices},
            candidates: R.without(dissocRelations(appServices || []))(orgServices),
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id}, state)
          }
        ]
      }

    default:
      throw new Error("Column config not found")
  }
}