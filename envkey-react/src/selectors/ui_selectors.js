import R from 'ramda'
import db from 'lib/db'

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

  getIsRevokingAssocKey = (id, state)=> getIsRevokingAssocKeyById(state)[id] || false
