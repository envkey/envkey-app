import {camelize, decamelize} from 'xcase'
import pluralize from 'pluralize'
import R from 'ramda'

export const
  getJoinType = ({parentType, assocType, isManyToMany})=> {
    return isManyToMany ?
      camelize([decamelize(parentType), decamelize(assocType)].join("_")) :
      assocType
  },

  getTrueParentAssoc = (meta)=> {
    const {parentType, assocType, parentId, assocId, isManyToMany, joinType: maybeJoinType} = meta,
          joinType = maybeJoinType || getJoinType(meta),
          trueParent = (!isManyToMany || joinType.indexOf(parentType) == 0) ? parentType : assocType,
          trueAssoc = trueParent == parentType ? assocType : parentType

    return {
      ...{parentType: trueParent, assocType: trueAssoc, joinType},
      ...(trueParent == parentType ? {assocId, parentId} :
                                     {assocId: parentId, parentId: assocId})
    }
  },

  getAssocUrl = (meta, targetPath)=>{
    const  {parentType, joinType, parentId} = meta,
           parentTable = decamelize(pluralize(parentType)),
           joinTable = decamelize(pluralize(joinType || getJoinType(meta)))

    return `/${parentTable}/${parentId}/${joinTable}${targetPath}.json`
  },

  getColumnsFlattened = R.pipe(
    R.map(
      R.pipe(
        R.prop('groups'),
        R.values
      )
    ),

    R.flatten
  )