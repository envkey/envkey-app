import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import {EnvImporter} from "../forms"

export default function({doImport, skipImport, isImporting, environments}){
  return h.div(".onboard-app-importer", [
    h.h1([
      h.em("Import "),
      " your config."
    ]),

    h(EnvImporter, {
      environments,
      onSubmit: doImport,
      skip: skipImport,
      isSubmitting: isImporting
    })
  ])
}