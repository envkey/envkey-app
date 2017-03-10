import React from 'react'
import {twitterShortTs} from 'lib/utils/date'
import h from "lib/ui/hyperscript_with_helpers"

export default function ({status, timestamp, envAccessGranted}){
  const classStr = ".status.secondary",
        ts =  " ・ " + twitterShortTs(timestamp)

  if (status == "owner"){
    return h.span(classStr, {className: "invite-pending"}, [
      "Created org ", ts
    ])
  }else if (status == "invited"){
    return h.span(classStr, {className: "invite-pending"}, [
      "Invite ",
      h.em(".pending", "pending"),
      ts
    ])
  } else if (status == "confirmed"){
    if (envAccessGranted){
      return h.span(classStr, [
        "Access ",
        h.em(".granted", "granted "),
        ts
      ])
    } else {
      return h.span(classStr, {className: "env-access-pending"}, [
        "Access ",
        h.em(".pending", "pending"),
        ts
      ])
    }
  }
}