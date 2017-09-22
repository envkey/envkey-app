import React from 'react'
import {twitterShortTs} from 'lib/utils/date'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from "components/shared/small_loader"

export default function ({status, timestamp}){
  const classStr = ".status.secondary",
        ts =  " ・ " + twitterShortTs(timestamp)

  if (status == "owner"){
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
      "Invite ",
      h.em(".granted", "accepted "),
      ts
    ])
  } else if (status == "expired"){
    return h.span(classStr, [
      "Invite ",
      h.em(".expired", "expired "),
      ts
    ])
  } else if (status == "revoked"){
    return h.span(classStr, [
      "Invite ",
      h.em(".revoked", "revoked "),
      ts
    ])
  } else if (status == "failed"){
    return h.span(classStr, [
      "Invite ",
      h.em(".failed", "failed "),
      ts
    ])
  }
}