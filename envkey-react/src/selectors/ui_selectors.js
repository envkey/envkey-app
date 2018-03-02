import R from 'ramda'
import db from 'lib/db'
import {flattenObj} from 'lib/utils/object'
import {getOrgUserForUser} from './object_selectors'

export const

  getCurrentRoute = db.path("routing", "locationBeforeTransitions"),

  getIsRemovingById = db.path("isRemoving"),

  getIsRemoving = (id, state)=> getIsRemovingById(state)[id] || false,

  getIsCreating = ({objectType, parentId, assocType, role}, state)=> {
    const path = ["isCreating"].concat(objectType ? [objectType] : [parentId, assocType, (role || "all")])

    return db.path(...path)(state)
  },

  getIsRenaming = (id, state)=> db.path("isRenaming", id)(state),

  getIsUpdatingSettings = (id, state)=> db.path("isUpdatingSettings", id)(state),

  getIsUpdatingOrgRole = (userId, state)=> db.path("isUpdatingOrgRole", userId)(state),

  getIsAddingAssoc = ({parentId, assocType, role}, state)=> {
    const isAdding = db.path("isAddingAssoc", parentId, assocType, (role || "all"))(state)
    return isAdding && !R.isEmpty(isAdding)
  },

  getIsGeneratingAssocKeyById = db.path("isGeneratingAssocKey"),

  getIsGeneratingAssocKey = (id, state)=> getIsGeneratingAssocKeyById(state)[id] || false,

  getIsRevokingAssocKeyById = db.path("isRevokingAssocKey"),

  getIsRevokingAssocKey = (id, state)=> getIsRevokingAssocKeyById(state)[id] || false,

  getIsUpdatingEnv = (appId, state)=> {
    const checkFns = ["isUpdatingEnv", "isAddingSubEnv", "isUpdatingSubEnv"].map(k => {
      return R.pipe(
        db.path(k),
        R.propOr({}, appId),
        flattenObj,
        R.complement(R.isEmpty)
      )
    })

    return getIsCreatingEnvEntry(appId, state) || R.anyPass(checkFns)(state)
  },

  getIsUpdatingEnvVal = ({appId, entryKey, environment}, state)=>{
    return db.path("isUpdatingEnv", appId, entryKey, environment)(state)
  },

  getIsUpdatingEnvEntry = ({appId, entryKey, environment}, state)=>{
    return db.path("isUpdatingEnv", appId, entryKey, "key")(state)
  },

  getIsCreatingEnvEntry = (appId, state)=>{
    const val = db.path("isCreatingEnvEntry", appId)(state)
    return val && !R.isEmpty(val)
  },

  getIsGrantingEnvAccessByUserId = db.path("isGrantingEnvAccess"),

  getIsGrantingEnvAccess = (userId, state)=> {
    return getIsGrantingEnvAccessByUserId(state)[userId] || false
  }

