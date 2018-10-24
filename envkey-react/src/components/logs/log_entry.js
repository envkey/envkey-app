import React from 'react'
import R from 'ramda'
import moment from 'moment'

export default function({
  usersById,
  serversById,
  localKeysById,
  logEntry: {
    userId,
    keyableId,
    keyableType,
    loggableType,
    loggableId,
    actionType,
    createdAt
  }
}){
  const
    createdAtMoment = moment(createdAt),
    diffAgo = Date.now() - createdAtMoment.valueOf(),
    renderActor = ()=> {
      if (userId){
        const {firstName, lastName} = usersById[userId]
        if (firstName && lastName){
          return <span>{firstName} {lastName} </span>
        } else {
          return <span>Deleted User </span>
        }
      } else if (keyableId){
        let toJoin
        if (keyableType == "Server"){
          toJoin = [serversById[keyableId].name]
        } else if (keyableType == "LocalKey"){
          const {name, userId: localKeyUserId} = localKeysById[keyableId],
                {firstName, lastName} = usersById[localKeyUserId]
          toJoin = [
            firstName,
            lastName,
            `via ${name} Local Key`
          ]
        }

        return <span>{toJoin.join(" ")} </span>
      }
    },
    renderTs = ()=> {
      const toJoin = [createdAtMoment.format()]
      if (diffAgo < (1000 * 60 * 60 * 21)){
        toJoin.push(`(${createdAtMoment.fromNow()})`)
      }
      return <label>{toJoin.join(" ")} </label>
    }

  return <div className="log-entry">
    <label>{loggableType} </label>
    <span> by </span>
    {renderActor()}
    {renderTs()}
  </div>

}