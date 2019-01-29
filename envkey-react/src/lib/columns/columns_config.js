import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import pluralize from 'pluralize'
import {
  UserRowDisplay,
  AppRowDisplay,
  ServerRowDisplay,
  LocalKeyRowDisplay,
  AppConfigBlockRowDisplay
} from 'components/assoc_manager'
import {
  ServerForm,
  UserForm,
  LocalKeyForm
} from 'components/forms'
import { appRoleGroupLabel, imagePath } from 'lib/ui'
import { findSubEnv } from "envkey-client-core/dist/lib/env/query"
import {
  getUserGroupsByRoleForApp,
  getServerGroupsForApp,
  getAppGroupsForUser,
  getNonOrgAdminUsers,
  getApps,
  getIsAddingAssoc,
  getIsCreating,
  getUsersForApp,
  getAppsForConfigBlock,
  getConfigBlocksForApp,
  getConfigBlocks,
  getAppsForUser,
  getCurrentUserLocalKeysForApp,
  getCurrentUserAppsWithMinRole,
  getCurrentOrg,
  getOrgOwner,
  getUsers,
  getServerSubEnvOptsByRole,
  dissocRelations
} from 'selectors'

const adminUserPermissions = [
        h.span(["Can view + edit all environments."]),
        h.span(["Can manage server access."]),
        h.span(["Can invite collaborators + edit app settings."])
      ],
      productionUserPermissions = [
        h.span(["Can view + edit all environments."]),
        h.span(["Can manage server access."])
      ],
      developmentUserPermissions = [
        h.span(["Can view + edit development and staging."])
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
        currentOrg: getCurrentOrg(state),
        numUsers: getUsers(state).length,
        orgOwner: getOrgOwner(state),
        columns: [
          {
            title: "Admin",
            subtitle: "Access",
            role: "admin",
            groups: R.pick(["org_owner", "org_admin", "admin"], userGroups),
            sectionTitleFn: appRoleGroupLabel,
            permissionCopyLines: adminUserPermissions,
            keyLabel: "development",
            orgRolesInvitable: state.orgRolesInvitable,
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
      const serverGroups = getServerGroupsForApp(parent.id, state),
            subEnvOptsByRole = getServerSubEnvOptsByRole(parent.id, state)

      return {
        rowDisplayType: ServerRowDisplay,
        addFormType: ServerForm,
        addLabel: ({title})=> [h.span(`Add another ${title.toLowerCase()} server key`), h.span(".img", [h.img({src: imagePath("circle-plus-white.svg")})])],
        removeLabel: [h.span("Cancel"), h.span(".img", [h.span("x")])],
        inlineAddForm: true,
        canAddFn: R.anyPass([
          R.pipe(R.path(["config", "groups"]), R.values, R.head, R.length, R.lt(1)),
          R.pipe(R.path(["config", "groups"]), R.values, R.any(R.any(R.prop("keyGeneratedAt"))))
        ]),
        showSectionFn: (subEnvId, props)=> {
          return Boolean(!subEnvId || subEnvId == "null" || !props.parent.envsWithMeta || findSubEnv(subEnvId, props.parent.envsWithMeta))
        },
        sectionTitleFn: (subEnvId, props) => {
          if (!parent.envsWithMeta)return null
          return subEnvId == "null" ?
            `${props.config.role} Environment` :
            [
              h.img({src: imagePath("subenvs-white.svg")}),
              h.span(`${findSubEnv(subEnvId, parent.envsWithMeta)["@@__name__"]}`)
            ]
        },
        sectionSubtitleFn: (subEnvId, props) => `Sub-environment`,
        columns: [
          {
            title: "Test",
            subtitle: "Server Keys",
            role: "development",
            groups: serverGroups.development,
            subEnvOpts: subEnvOptsByRole["development"],
            keyLabel: "development",
            permissionCopyLines: [h.span(["Connect to the ", h.strong("development"), " environment."])],
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "development"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "development"}, state)
          },
          {
            title: "Staging",
            subtitle: "Server Keys",
            role: "staging",
            groups: serverGroups.staging,
            subEnvOpts: subEnvOptsByRole["staging"],
            keyLabel: "staging",
            permissionCopyLines: [h.span(["Connect to the ", h.strong("staging"), " environment."])],
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "staging"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "staging"}, state)
          },
          {
            title: "Production",
            subtitle: "Server Keys",
            role: "production",
            groups: serverGroups.production,
            subEnvOpts: subEnvOptsByRole["production"],
            keyLabel: "production",
            permissionCopyLines: [h.span(["Connect to the ", h.strong("production"), " environment."])],
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "production"}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id, role: "production"}, state)
          }
        ]
      }

    case "app-localKey":
      return {
        rowDisplayType: LocalKeyRowDisplay,
        addFormType: LocalKeyForm,
        addLabel: [h.span("Add another local development key"), h.span(".img", [h.img({src: imagePath("circle-plus-white.svg")})])],
        removeLabel: [h.span("Cancel"), h.span(".img", [h.span("x")])],
        inlineAddForm: true,
        canAddFn: R.anyPass([
          R.pipe(R.path(["config", "groups"]), R.values, R.head, R.length, R.lt(1)),
          R.pipe(R.path(["config", "groups"]), R.values, R.head, R.head, R.prop("keyGeneratedAt"), Boolean)
        ]),

        columns: [
          {
            // title: "Local Development",
            // subtitle: "Keys",
            role: "development",
            groups: {development: getCurrentUserLocalKeysForApp(parent.id, state)},
            keyLabel: "development",
            // permissionCopyLines: [h.span(["Connect to the ", h.strong("development"), " environment."])],
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

      let userAppColumns = [{
        title: "Admin",
        subtitle: "Access",
        role: "admin",
        groups: R.pick(appAdminRoles, appGroups),
        sectionTitleFn: appRoleGroupLabel,
        permissionCopyLines: adminUserPermissions,
        keyLabel: "development",
        isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id, role: "admin"}, state),
        isCreating: getIsCreating({assocType, parentId: parent.id, role: "admin"}, state),
        candidates: appCandidates
      }]

      if(!["org_owner", "org_admin"].includes(parent.role)){
        userAppColumns = userAppColumns.concat([
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
        columns: userAppColumns
      }

    case "configBlock-app":
      const blockApps = getAppsForConfigBlock(parent.id, state),
            blockAppsWithoutRelations = dissocRelations(blockApps),
            blockAppCandidates = R.without(blockAppsWithoutRelations, getCurrentUserAppsWithMinRole("production", state))

      let configBlockAppColumns = [{
        title: "Connected Apps",
        groups: {apps: blockApps},
        isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id}, state),
        isCreating: getIsCreating({assocType, parentId: parent.id}, state),
        candidates: blockAppCandidates
      }]

      return {
        rowDisplayType: AppRowDisplay,
        addLabel: "+",
        addExistingSubmitLabelFn: (n)=> "Connect Apps",
        addExistingTextFn: R.prop("name"),
        parentNameFn: R.prop("name"),
        columns: configBlockAppColumns
      }

    case "app-configBlock":
      const appBlocks = getConfigBlocksForApp(parent.id, state),
            orgBlocks = getConfigBlocks(state)

      return {
        rowDisplayType: AppConfigBlockRowDisplay,
        // addFormType: ServiceForm,
        addLabel: "+",
        addExistingSubmitLabelFn: (n)=> "Connect",
        addExistingTextFn: R.prop("name"),
        addExistingLabel: "Connect Blocks",
        // addNewLabel: "Create New Mixin",
        columns: [
          {
            title: "Connected Blocks",
            groups: {configBlocks: appBlocks},
            candidates: R.without(dissocRelations(appBlocks || []))(orgBlocks),
            isAddingAssoc: getIsAddingAssoc({assocType, parentId: parent.id}, state),
            isCreating: getIsCreating({assocType, parentId: parent.id}, state)
          }
        ]
      }

    default:
      throw new Error("Column config not found")
  }
}