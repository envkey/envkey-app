import db from 'lib/db'
import R from 'ramda'

export const

  getImportErrors = R.curry((id, state)=> db.path("importErrors", id)(state)),

  getImportActionsPending = R.curry((id, state)=> db.path("importActionsPending", id)(state) || []),

  getDidOnboardImport = R.curry((id, state)=> db.path("didOnboardImport", id)(state)),

  getIsImportingAllEnvironments = R.curry((id, state)=>{
    return db.path("isImportingConfig", id, "all")(state)
  }),

  getIsImportingEnvironment = R.curry((id, environment, state)=>{
    return db.path("isImportingConfig", id, environment)(state)
  }),

  getIsImportingAnyEnvironment = R.curry((id, state)=>{
    const res = db.path("isImportingConfig", id)
    return res && !R.isEmpty(res)
  })






