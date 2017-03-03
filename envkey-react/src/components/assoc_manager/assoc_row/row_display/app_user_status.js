import React from 'react'
import moment from 'moment'
import h from "lib/ui/hyperscript_with_helpers"

export default function ({status, timestamp, envAccessGranted}){
  const classStr = ".status.secondary",
        dt = moment(timestamp)

  if (status == "invited"){
    return h.span(classStr, {className: "invite-pending"}, [
      "Invite ",
      h.em(".pending", "pending"),
      " - ",
      dt.fromNow()
    ])
  } else if (status == "confirmed"){
    if (envAccessGranted){
      return h.span(classStr, [
        "Access ",
        h.em(".granted", "granted "),
        dt.fromNow()
      ])
    } else {
      return h.span(classStr, {className: "env-access-pending"}, [
        "Access ",
        h.em(".pending", "pending"),
        " -  ",
        dt.fromNow()
      ])
    }
  }
}