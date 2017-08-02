import React from 'react'
import {twitterShortTs} from 'lib/utils/date'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from "components/shared/small_loader"

export default function ({status, timestamp, isGrantingEnvAccess}){
  const classStr = ".status.secondary",
        ts =  " ・ " + twitterShortTs(timestamp)

  if (isGrantingEnvAccess){
    return h.div(classStr, {className: "granting-env-access"}, [
      h.span("Granting secure access..."),
      h(SmallLoader)
    ])
  } else if (status == "owner"){
    return h.span(classStr, {className: "invite-pending"}, [
      "Created org ", ts
    ])
  } else if (status == "invited"){
    return h.span(classStr, {className: "invite-pending"}, [
      "Invite ",
      h.em(".pending", "pending"),
      ts
    ])
  } else if (status == "confirmed"){
    return h.span(classStr, [
      "Access ",
      h.em(".granted", "granted "),
      ts
    ])
  }
}