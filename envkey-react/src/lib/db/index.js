import { createSelector, defaultMemoize } from 'reselect'
import pluralize from 'pluralize'
import R from 'ramda'
import {capitalize} from 'lib/utils/string'


const
  stringValToFn = (val, wrapper) => typeof val == "string" ? wrapper(val) : val,

  propToFn = (prop)=> stringValToFn(prop, R.prop),

  conditionToFn = (cond) => stringValToFn(cond, R.equals),

  conditionsToFns = conditions => R.mapObjIndexed(conditionToFn, conditions),

  optionalFn = (key, methodFn, opts={}, toFn=propToFn)=>{
    const optsFn = toFn(opts[key])
    return optsFn ? methodFn(optsFn) : R.identity
  },

  optionalSortBy = opts => optionalFn("sortBy", sortByFn => R.sortBy(sortByFn), opts),

  optionalReverse = opts => optionalFn("reverse", ()=> R.reverse, opts),

  optionalGroupBy = opts => optionalFn("groupBy", groupByFn => R.groupBy(groupByFn), opts),

  optionalWhere = opts => optionalFn("where", conditionFns => R.filter(R.where(conditionFns)), opts, conditionsToFns),

  optionsPipe = opts => R.pipe(
    optionalWhere(opts),
    optionalSortBy(opts),
    optionalReverse(opts),
    optionalGroupBy(opts)
  )

export const
  path = (...args)=> R.path(args),

  index = t => path(t),

  find = t => (id, state) => {
    if (id && !state)return R.partial(find(t), [id])
    return index(t)(state)[id]
  },

  ids = t => createSelector(index(t), R.keys),

  list = (t, opts) => {
    return createSelector(
      index(t),
      R.pipe(
        R.values,
        optionsPipe(opts)
      )
    )
  },

  indexBy = (t, prop)=> createSelector(
    list(t),
    R.indexBy(R.prop(prop))
  ),

  group = (t, propOrFn, opts)=> list(t, {...opts, groupBy: propOrFn}),

  findBy = (t, prop)=> {
    const selector = (val, state)=> {
      if (val && !state)return R.partial(selector, [val])
      return indexBy(t, prop)(state)[val]
    }
    return selector
  },

  where = (t, conditions, opts={})=> list(t, {...opts, where: {...(opts.where || {}), ...conditions}}),

  whereIn = (t, prop, arr, opts)=>{
    const set = new Set(arr)
    return where(t, {[prop]: val => set.has(val)}, opts)
  },

  whereNotIn = (t, prop, arr, opts)=>{
    const set = new Set(arr)
    return where(t, {[prop]: val => !set.has(val)}, opts)
  },

  hasMany = (t, t2, opts)=>{
    const
      fk = `${pluralize.singular(t)}Id`,
      selector = (id, state)=> {
        if (id && !state)return R.partial(selector, [id])
        const res = group(t2, fk)(state)[id] || []
        return optionsPipe(opts)(res)
      }

    return selector
  },

  hasAndBelongsToMany = (t1, t2, opts={})=>{
    const
      {through=null} = opts,
      [singularT1, singularT2] = [t1,t2].map(pluralize.singular),
      relationTbl = through || pluralize([singularT1, capitalize(singularT2)].join("")),
      fk1 = `${singularT1}Id`,
      fk2 = `${singularT2}Id`,

      selector = (id, state)=> {
        if (id && !state)return R.partial(selector, [id])

        const listRelations = hasMany(t1, relationTbl)(id, state),
              t2Ids = R.pluck(fk2, listRelations),
              attachRelation = associated => {
                const relations = where(relationTbl, {[fk1]: id, [fk2]: associated.id})(state)
                return R.assoc("relation", relations[0], associated)
              }

        return R.pipe(
          whereIn(t2, "id", t2Ids),
          R.map(attachRelation),
          optionsPipe(opts)
        )(state)
      }

    return defaultMemoize(selector)
  }

const methods = module.exports,
      db = t => R.mapObjIndexed((method, k)=> R.partial(method, [t]), methods)

for (let k in methods){
  db[k] = methods[k]
}

db.init = (...types) => types.forEach(type => db[type] = db(type))

export default db

