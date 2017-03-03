import {decamelize} from 'xcase'
import pluralize from 'pluralize'

export const
  assocTable = ({parentType, assocType, isManyToMany})=> {
    return isManyToMany ?
      [decamelize(parentType), decamelize(pluralize(assocType))].join("_") :
      decamelize(pluralize(assocType))
  }