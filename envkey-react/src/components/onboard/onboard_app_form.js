import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import {AppForm} from "../forms"

export default function({createApp}){

  return h.div(".onboard-app-form", [

    h.h2("Create your first application."),

    h(AppForm, {onSubmit: createApp})
  ])

}