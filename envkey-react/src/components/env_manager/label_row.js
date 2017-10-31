import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import {Link} from "react-router"
import {imagePath} from "lib/ui"

export default function({
  parent,
  envsWithMeta,
  environments,
  isSubEnvsLabel,
  onOpenSubEnvs,
  onCloseSubEnvs,
  location,
  params
}) {

  const
    locked = environment => parent.role == "development" && environment == "production",

    hasSubEnvs = environment => !R.isEmpty(R.pathOr({}, [environment, "@@__sub__"], envsWithMeta)),

    renderSubEnvsAction = (environment)=>{
      if (!(parent.role == "development" && !hasSubEnvs(environment))){
        if (isSubEnvsLabel){
          return h(Link, {className: "close-subenvs", to: location.pathname.replace(new RegExp(`/${params.sub}/.*$`), "")}, [
            h.i("←")
          ])
        } else {
          return h(Link, {className: "open-subenvs", to: location.pathname + `/${environment}/first`}, [
            h.img({src: imagePath("subenvs-zoom-white.svg")})
          ])
        }
      }
    },

    renderEnvLabel = (environment, i)=> {
      return h.div(".label-cell", {
        key: i,
        className: `env-${environment} ${locked(environment) ? 'locked' : ''}`
      }, [
        renderSubEnvsAction(environment),
        h.label([
          locked(environment) ? h.img(".img-locked", {src: imagePath("padlock.svg")}) : "",
          h.strong(environment)
        ])
      ])
    }

  return h.div(".row.label-row",
    [h.div(".cols", environments.map(renderEnvLabel))]
  )
}