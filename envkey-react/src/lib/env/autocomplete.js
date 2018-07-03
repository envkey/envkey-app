import R from 'ramda'
import {inheritableEnvs} from "envkey-client-core/dist/lib/env/inheritance"

const getEnvsFilter = ({entryKey, envsWithMeta, environment}, searchStr) => envOpt => {
  const inheritable = inheritableEnvs({envsWithMeta, entryKey, environment})
  return inheritable.includes(envOpt)
}

export const optIndex = (searchStr, opts) => R.findIndex(({val})=> val === searchStr)(opts)

export const getAutocompleteOpts = ({entryKey,
                                  inherits,
                                  val,
                                  envsWithMeta,
                                  environments,
                                  environment}, searchStr)=>{
  const searchStrIsEnv = environments.includes(searchStr),

        baseOpts = searchStr && !searchStrIsEnv ?
          [] :
          [{val: null, label: "undefined", className: "undefined", isSpecial: true},
           {val: "", label: "empty string", className: "empty-string", isSpecial: true}],

        envOpts = environments.filter(getEnvsFilter({entryKey, envsWithMeta, environment}, searchStr))
                              .map(envOpt => ({val: envOpt,
                                               label: envOpt,
                                               selectedInherits: true,
                                               className: "inherits",
                                               prefix: "inherits"})),

        opts = baseOpts.concat(envOpts),

        hasMatch = optIndex(searchStr, opts) > -1

  return hasMatch ? opts : opts.filter(({val})=> val && val.indexOf(searchStr) == 0)
}