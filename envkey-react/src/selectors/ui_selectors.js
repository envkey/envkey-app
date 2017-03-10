import R from 'ramda'
import db from 'lib/db'
import {flattenObj} from 'lib/utils/object'

export const

  getIsRemoving = (id, state)=> db.path("isRemoving", id)(state),

  getIsCreating = ({objectType, parentId, assocType, role}, state)=> {
    const path = ["isCreating"].concat(objectType ? [objectType] : [parentId, assocType, (role || "all")])
    return db.path(...path)(state)
  },

  getIsRenaming = (id, state)=> db.path("isRenaming", id)(state),

  getIsUpdatingSettings = (id, state)=> db.path("isUpdatingSetings", id)(state),

  getIsAddingAssoc = ({parentId, assocType, role}, state)=> {
    const isAdding = db.path("isAddingAssoc", parentId, assocType, (role || "all"))(state)
    return isAdding && !R.isEmpty(isAdding)
  },

  getIsGeneratingAssocKey = (id, state)=> db.path("isGeneratingAssocKey", id)(state),

  getIsUpdatingEnv = (parentId, state)=> {
    return R.pipe(
      db.path("isUpdatingEnv"),
      R.propOr({}, parentId),
      flattenObj,
      R.complement(R.isEmpty)
    )(state)
  },

  getIsUpdatingEnvVal = ({parentId, entryKey, environment}, state)=>{
    return db.path("isUpdatingEnv", parentId, entryKey, environment)(state)
  },

  getIsUpdatingEnvEntry = ({parentId, entryKey, environment}, state)=>{
    return db.path("isUpdatingEnv", parentId, entryKey, "key")(state)
  },

  getIsCreatingEnvEntry = (parentId, state)=>{
    return db.path("isCreatingEnvEntry", parentId)(state)
  }